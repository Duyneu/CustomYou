import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/formatters";
import { CurrencyDisplay } from "@/components/antigravity/currency-display";
import { GlassCard } from "@/components/antigravity/glass-card";
import { AnimatedContainer, AnimatedItem } from "@/components/antigravity/animated-container";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PieChart,
  CheckCircle2,
  Circle,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Plus,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  // 1. Lấy danh sách tài khoản / ví
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

  let weeklySummaryText = "Chào mừng bạn trở lại với MyHub.";
  if (lastWeekVal > 0n) {
    const diff = Number(thisWeekVal - lastWeekVal);
    const percent = Math.abs(Math.round((diff / Number(lastWeekVal)) * 100));
    if (diff < 0) {
      weeklySummaryText = `🎉 Tuần này bạn chi ${formatVND(thisWeekVal)}, ít hơn tuần trước ${percent}%. Rất tuyệt vời!`;
    } else {
      weeklySummaryText = `⚠️ Tuần này bạn chi ${formatVND(thisWeekVal)}, nhiều hơn tuần trước ${percent}%. Chú ý ngân sách nhé.`;
    }
  }

  // 4. Lấy danh sách việc cần làm (Todos)
  const todos = await prisma.todo.findMany({
    where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
    orderBy: { priority: "desc" },
    take: 5,
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
    <AnimatedContainer className="space-y-8">
      {/* 1. Header Banner & Lời chào tóm tắt tự động */}
      <AnimatedItem>
        <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-emerald-900/40 via-teal-900/20 to-slate-900/60 border border-emerald-500/20 shadow-antigravity-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="gap-1 py-1 px-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tóm tắt tự động
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Tháng {now.getMonth() + 1}/{now.getFullYear()}
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
                {weeklySummaryText}
              </h2>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Mọi dữ liệu tài chính & nhiệm vụ của bạn đều được đồng bộ và kiểm soát an toàn.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/finance/transactions">
                <Button className="rounded-xl shadow-md gap-1.5">
                  <Plus className="w-4 h-4" />
                  Thêm giao dịch
                </Button>
              </Link>
              <Link href="/finance/bank-connect">
                <Button variant="glass" className="rounded-xl gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  Kết nối ngân hàng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedItem>

      {/* 2. Hàng chỉ số tài chính Antigravity Cards (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatedItem>
          <GlassCard enableTilt glow className="space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Tổng tài sản thực có
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <CurrencyDisplay amount={totalBalance} size="xl" className="text-foreground" />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>Đang quản lý trên {accounts.length} ví & tài khoản</span>
              </p>
            </div>
          </GlassCard>
        </AnimatedItem>

        <AnimatedItem>
          <GlassCard enableTilt className="space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Chi tiêu tháng này
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <CurrencyDisplay amount={totalExpenseThisMonth} size="xl" type="EXPENSE" />
              <p className="text-xs text-muted-foreground mt-1">
                Ngân sách đã cấu hình sẵn sàng
              </p>
            </div>
          </GlassCard>
        </AnimatedItem>

        <AnimatedItem>
          <GlassCard enableTilt className="space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold tracking-wider uppercase">
                Thu nhập tháng này
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <CurrencyDisplay amount={totalIncomeThisMonth} size="xl" type="INCOME" />
              <p className="text-xs text-muted-foreground mt-1">
                Dòng tiền ròng: {formatVND(totalIncomeThisMonth - totalExpenseThisMonth)}
              </p>
            </div>
          </GlassCard>
        </AnimatedItem>
      </div>

      {/* 3. Grid 2 cột: Danh sách ví & Thói quen + Việc cần làm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái (7 cột): Danh sách Ví / Tài khoản */}
        <AnimatedItem className="lg:col-span-7 space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm lg:text-base">
                  Ví & Tài khoản liên kết ({accounts.length})
                </h3>
              </div>
              <Link
                href="/finance/accounts"
                className="text-xs text-emerald-500 hover:underline flex items-center gap-0.5"
              >
                Quản lý ví <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 hover:bg-white/40 dark:hover:bg-slate-800/40 border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: acc.color || "#10b981" }}
                    >
                      {acc.type === "BANK" ? (
                        <Building2 className="w-5 h-5" />
                      ) : acc.type === "E_WALLET" ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Wallet className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {acc.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {acc.bankCode ? `${acc.bankCode} • ` : ""}
                        {acc.accountNumberMasked || "Tiền mặt"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={acc.balance} size="md" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Mục tiêu tiết kiệm mini */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm lg:text-base">
                  Mục tiêu tiết kiệm
                </h3>
              </div>
              <Link
                href="/finance/goals"
                className="text-xs text-emerald-500 hover:underline flex items-center gap-0.5"
              >
                Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {goals.map((g) => {
                const percent = Math.min(
                  100,
                  Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100)
                );
                return (
                  <div key={g.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{g.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {formatVND(g.currentAmount)} / {formatVND(g.targetAmount)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </AnimatedItem>

        {/* Cột phải (5 cột): Năng suất (Việc hôm nay & Thói quen Streak) */}
        <AnimatedItem className="lg:col-span-5 space-y-6">
          {/* Việc cần làm */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm lg:text-base">
                  Việc cần làm hôm nay ({todos.length})
                </h3>
              </div>
              <Link
                href="/productivity/todos"
                className="text-xs text-emerald-500 hover:underline flex items-center gap-0.5"
              >
                Mở sổ việc <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {todos.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Không còn việc nào tồn đọng. Bạn đã hoàn thành xuất sắc!
                </p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-white/5"
                  >
                    <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {todo.description}
                        </p>
                      )}
                    </div>
                    {todo.priority === "HIGH" && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-2">
                        Gấp
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Thói quen & Chuỗi Streak */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm lg:text-base">
                  Chuỗi thói quen (Streak)
                </h3>
              </div>
              <Link
                href="/productivity/habits"
                className="text-xs text-emerald-500 hover:underline flex items-center gap-0.5"
              >
                Chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompletedToday = habit.logs.length > 0 && habit.logs[0].completed;
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {habit.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="font-semibold text-amber-500">
                            {habit.currentStreak} ngày liên tiếp
                          </span>
                          <span>•</span>
                          <span>Kỷ lục: {habit.longestStreak} ngày</span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={isCompletedToday ? "success" : "outline"}
                      className="text-xs"
                    >
                      {isCompletedToday ? "Đã check-in" : "Chưa làm"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </AnimatedItem>
      </div>
    </AnimatedContainer>
  );
}
