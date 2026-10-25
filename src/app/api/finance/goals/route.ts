import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = goals.map((g) => ({
    ...g,
    targetAmount: g.targetAmount.toString(),
    currentAmount: g.currentAmount.toString(),
  }));

  return NextResponse.json({ goals: serialized });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, targetAmount, currentAmount, targetDate } = body;

    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Vui lòng nhập tên và số tiền mục tiêu" }, { status: 400 });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name,
        targetAmount: BigInt(targetAmount),
        currentAmount: BigInt(currentAmount || 0),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      goal: {
        ...goal,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi tạo mục tiêu" }, { status: 500 });
  }
}
