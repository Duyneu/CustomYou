import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const tx = await prisma.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!tx) {
      return NextResponse.json({ error: "Giao dịch không tồn tại" }, { status: 404 });
    }

    // Hoàn tác số dư trong Prisma Transaction
    await prisma.$transaction(async (txClient) => {
      if (tx.type === "EXPENSE") {
        await txClient.account.update({
          where: { id: tx.accountId },
          data: { balance: { increment: tx.amount } },
        });
      } else if (tx.type === "INCOME") {
        await txClient.account.update({
          where: { id: tx.accountId },
          data: { balance: { decrement: tx.amount } },
        });
      } else if (tx.type === "TRANSFER" && tx.targetAccountId) {
        await txClient.account.update({
          where: { id: tx.accountId },
          data: { balance: { increment: tx.amount } },
        });
        await txClient.account.update({
          where: { id: tx.targetAccountId },
          data: { balance: { decrement: tx.amount } },
        });
      }

      await txClient.transaction.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: "Đã xóa giao dịch và cập nhật lại số dư." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể xóa giao dịch" },
      { status: 500 }
    );
  }
}
