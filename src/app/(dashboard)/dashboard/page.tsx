import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/formatters";
import { CurrencyDisplay } from "@/components/antigravity/currency-display";
import {
  Wallet,
  CheckCircle2,
  Circle,
  Plus,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    // 1. Lấy danh sách tài khoản và ví
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const totalBalance = accounts
      .filter((a) => !a.isExcludedFromTotal)
      .reduce((sum, a) => sum + a.balance, 0n);

    // 2. Lấy chi tiêu tháng hiện tại
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactionsThisMonth = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      include: { category: true },
    });

    const totalExpenseThisMonth = transactionsThisMonth
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0n);

    const totalIncomeThisMonth = transactionsThisMonth
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0n);

    // 3. Tóm tắt tuần tự động (Tuần này vs Tuần trước)
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);

    const [expenseThisWeek, expenseLastWeek] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: oneWeekAgo } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: twoWeeksAgo, lt: oneWeekAgo } },
        _sum: { amount: true },
      }),
    ]);

    const thisWeekVal = expenseThisWeek._sum.amount || 0n;
    const lastWeekVal = expenseLastWeek._sum.amount || 0n;

    let weeklyComparison = "Dữ liệu chi tiêu tuần này ổn định.";
    if (lastWeekVal > 0n) {
      const diff = Number(thisWeekVal - lastWeekVal);
      const percent = Math.abs(Math.round((diff / Number(lastWeekVal)) * 100));
      if (diff < 0) {
        weeklyComparison = `Chi tiêu tuần này ${formatVND(thisWeekVal.toString())}, giảm ${percent}% so với tuần trước.`;
      } else {
        weeklyComparison = `Chi tiêu tuần này ${formatVND(thisWeekVal.toString())}, tăng ${percent}% so với tuần trước.`;
      }
    }

    // 4. Lấy danh sách việc cần làm (Todos)
    const todos = await prisma.todo.findMany({
      where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
      orderBy: { priority: "desc" },
      take: 4,
    });

    // 5. Lấy danh sách thói quen (Habits)
    const todayStr = new Date().toISOString().split("T")[0];
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: { date: todayStr },
        },
      },
      take: 4,
    });

    // 6. Lấy mục tiêu tiết kiệm
    const goals = await prisma.savingsGoal.findMany({
      where: { userId, status: "IN_PROGRESS" },
      take: 2,
    });

    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* 1. Header Hero Tối giản: Thông điệp tài chính rõ ràng, hành động tức thì */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Tổng quan tài chính tháng {now.getMonth() + 1}/{now.getFullYear()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {weeklyComparison}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/finance/transactions">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Ghi nhận giao dịch
              </Button>
            </Link>
            <Link href="/finance/bank-connect">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Kết nối ngân hàng
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Chỉ số tài chính cốt lõi (3 cột tối giản, không lồng thẻ, không viền rườm rà) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-border bg-card space-y-1">
            <div className="text-xs text-muted-foreground font-normal">
              Tổng tài sản hiện có
            </div>
            <CurrencyDisplay amount={totalBalance.toString()} size="xl" />
            <div className="text-xs text-muted-foreground pt-1">
              Phân bổ trên {accounts.length} tài khoản
            </div>
          </div>

          <div className="p-5 rounded-lg border border-border bg-card space-y-1">
            <div className="text-xs text-muted-foreground font-normal">
              Chi tiêu trong tháng
            </div>
            <CurrencyDisplay amount={totalExpenseThisMonth.toString()} size="xl" type="EXPENSE" />
            <div className="text-xs text-muted-foreground pt-1">
              Tháng {now.getMonth() + 1}
            </div>
          </div>

          <div className="p-5 rounded-lg border border-border bg-card space-y-1">
            <div className="text-xs text-muted-foreground font-normal">
              Thu nhập trong tháng
            </div>
            <CurrencyDisplay amount={totalIncomeThisMonth.toString()} size="xl" type="INCOME" />
            <div className="text-xs text-muted-foreground pt-1 font-mono">
              Dòng tiền thuần: {formatVND((totalIncomeThisMonth - totalExpenseThisMonth).toString())}
            </div>
          </div>
        </div>

        {/* 3. Phân chia 2 cột: Tài khoản & Nhiệm vụ / Thói quen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái (7 cột): Danh sách Ví & Mục tiêu tiết kiệm */}
          <div className="lg:col-span-7 space-y-8">
            {/* Danh sách tài khoản dạng bảng tối giản */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Tài khoản và nguồn tiền
                </h2>
                <Link
                  href="/finance/accounts"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Quản lý danh sách <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-border border-b border-border">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {acc.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {acc.bankCode ? `${acc.bankCode} / ` : ""}
                        {acc.accountNumberMasked || "Tiền mặt"}
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyDisplay amount={acc.balance.toString()} size="md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mục tiêu tiết kiệm */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Mục tiêu tiết kiệm
                </h2>
                <Link
                  href="/finance/goals"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Tất cả mục tiêu <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-4 pt-1">
                {goals.map((g) => {
                  const percent = Math.min(
                    100,
                    Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100)
                  );
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-medium text-foreground">{g.name}</span>
                        <span className="font-mono text-muted-foreground">
                          {formatVND(g.currentAmount.toString())} / {formatVND(g.targetAmount.toString())} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cột phải (5 cột): Việc hôm nay & Chuỗi thói quen */}
          <div className="lg:col-span-5 space-y-8">
            {/* Việc cần làm */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Việc cần làm hôm nay
                </h2>
                <Link
                  href="/productivity/todos"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Mở sổ việc <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-border border-b border-border">
                {todos.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">
                    Không còn việc tồn đọng.
                  </p>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between py-2.5 gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {todo.title}
                        </span>
                      </div>
                      {todo.priority === "HIGH" && (
                        <Badge variant="destructive" className="shrink-0 text-[10px]">
                          Quan trọng
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Thói quen */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Thói quen hàng ngày
                </h2>
                <Link
                  href="/productivity/habits"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Chi tiết <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-border border-b border-border">
                {habits.map((habit) => {
                  const isCompletedToday = habit.logs.length > 0 && habit.logs[0].completed;
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {habit.name}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          Chuỗi: {habit.currentStreak} ngày
                        </div>
                      </div>

                      <Badge
                        variant={isCompletedToday ? "success" : "outline"}
                        className="text-xs font-mono"
                      >
                        {isCompletedToday ? "Đã xong" : "Chưa làm"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="p-8 border border-border rounded-lg text-center space-y-2 max-w-lg mx-auto">
        <h2 className="text-sm font-semibold text-foreground">
          Đang kết nối cơ sở dữ liệu
        </h2>
        <p className="text-xs text-muted-foreground">
          Hệ thống đang đồng bộ với cơ sở dữ liệu đám mây. Vui lòng tải lại trang sau giây lát.
        </p>
      </div>
    );
  }
}
