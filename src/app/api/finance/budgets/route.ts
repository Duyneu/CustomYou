import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertBudgetSchema } from "@/lib/validations/finance";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString(), 10);
  const year = parseInt(searchParams.get("year") || now.getFullYear().toString(), 10);

  // 1. Lấy danh sách ngân sách đã đặt cho tháng này
  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      month,
      year,
    },
    include: {
      category: true,
    },
  });

  // 2. Tính khoảng thời gian tháng
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  // 3. Gom chi tiêu thực tế cho từng danh mục
  const expenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      isExcludedFromBudget: false,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: {
      amount: true,
    },
  });

  const expenseMap = new Map<string, bigint>();
  for (const exp of expenses) {
    if (exp.categoryId) {
      expenseMap.set(exp.categoryId, exp._sum.amount || 0n);
    }
  }

  const result = budgets.map((b) => {
    const spent = expenseMap.get(b.categoryId) || 0n;
    const limit = b.limitAmount;
    const percent = limit > 0n ? Math.round((Number(spent) / Number(limit)) * 100) : 0;

    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      categoryColor: b.category.color,
      month: b.month,
      year: b.year,
      limitAmount: limit.toString(),
      spentAmount: spent.toString(),
      remainingAmount: (limit - spent).toString(),
      percentage: percent,
      isWarning: percent >= 80 && percent < 100,
      isExceeded: percent >= 100,
    };
  });

  return NextResponse.json({
    month,
    year,
    budgets: result,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = upsertBudgetSchema.parse(body);

    const limitAmount = BigInt(validated.limitAmount);

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId: validated.categoryId,
          month: validated.month,
          year: validated.year,
        },
      },
      update: {
        limitAmount,
      },
      create: {
        userId: session.user.id,
        categoryId: validated.categoryId,
        month: validated.month,
        year: validated.year,
        limitAmount,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      budget: {
        ...budget,
        limitAmount: budget.limitAmount.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || error.message || "Không thể lưu ngân sách" },
      { status: 400 }
    );
  }
}
