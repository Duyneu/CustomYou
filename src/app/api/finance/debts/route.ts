import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const debts = await prisma.debtLoan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = debts.map((d) => ({
    ...d,
    totalAmount: d.totalAmount.toString(),
    paidAmount: d.paidAmount.toString(),
  }));

  return NextResponse.json({ debts: serialized });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, counterpartyName, totalAmount, dueDate, note } = body;

    if (!counterpartyName || !totalAmount) {
      return NextResponse.json({ error: "Vui lòng nhập đối tác và số tiền" }, { status: 400 });
    }

    const debt = await prisma.debtLoan.create({
      data: {
        userId: session.user.id,
        type: type === "LENT" ? "LENT" : "BORROWED",
        counterpartyName,
        totalAmount: BigInt(totalAmount),
        paidAmount: 0n,
        dueDate: dueDate ? new Date(dueDate) : null,
        note,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      debt: {
        ...debt,
        totalAmount: debt.totalAmount.toString(),
        paidAmount: debt.paidAmount.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi tạo khoản nợ" }, { status: 500 });
  }
}
