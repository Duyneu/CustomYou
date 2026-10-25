import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAccountSchema } from "@/lib/validations/finance";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = updateAccountSchema.parse(body);

    const account = await prisma.account.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    const updated = await prisma.account.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({
      account: {
        ...updated,
        balance: updated.balance.toString(),
        initialBalance: updated.initialBalance.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || error.message || "Không thể cập nhật tài khoản" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const account = await prisma.account.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { _count: { select: { transactions: true } } },
    });

    if (!account) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    // Nếu tài khoản đã có giao dịch, đánh dấu isActive = false (lưu trữ) thay vì xóa cứng để không hỏng lịch sử
    if (account._count.transactions > 0) {
      await prisma.account.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Đã lưu trữ tài khoản (vì có giao dịch liên quan)." });
    }

    await prisma.account.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Đã xóa tài khoản thành công." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể xóa tài khoản" },
      { status: 500 }
    );
  }
}
