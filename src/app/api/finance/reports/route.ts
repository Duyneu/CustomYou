import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // 1. Lấy tất cả giao dịch trong 6 tháng qua
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: sixMonthsAgo },
    },
    include: {
      category: true,
    },
    orderBy: { date: "asc" },
  });

  // 2. Gom nhóm theo tháng (T1, T2, ... T6)
  const monthlyDataMap = new Map<string, { month: string; income: number; expense: number; net: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `T${d.getMonth() + 1}/${d.getFullYear()}`;
    monthlyDataMap.set(key, { month: key, income: 0, expense: 0, net: 0 });
  }

  const categoryExpenseMap = new Map<string, number>();

  const currentMonthKey = `T${now.getMonth() + 1}/${now.getFullYear()}`;

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `T${d.getMonth() + 1}/${d.getFullYear()}`;
    const numAmt = Number(tx.amount);

    if (monthlyDataMap.has(key)) {
      const entry = monthlyDataMap.get(key)!;
      if (tx.type === "INCOME") {
        entry.income += numAmt;
        entry.net += numAmt;
      } else if (tx.type === "EXPENSE") {
        entry.expense += numAmt;
        entry.net -= numAmt;
      }
    }

    // Nếu là tháng hiện tại và là chi tiêu -> gom vào danh mục
    if (key === currentMonthKey && tx.type === "EXPENSE") {
      const catName = tx.category?.name || "Chưa phân loại";
      categoryExpenseMap.set(catName, (categoryExpenseMap.get(catName) || 0) + numAmt);
    }
  }

  const sixMonthTrends = Array.from(monthlyDataMap.values());
  const categoryBreakdown = Array.from(categoryExpenseMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  return NextResponse.json({
    sixMonthTrends,
    categoryBreakdown,
  });
}
