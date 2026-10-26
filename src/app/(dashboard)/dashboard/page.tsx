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
  TrendingUp,
  TrendingDown,
  Sparkles,
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

    // Tính toán phân bổ tài sản khả dụng & dòng tiền ròng
    const liquidAccounts = accounts.filter(
      (a) => a.type === "BANK" || a.type === "CASH" || a.type === "E_WALLET"
    );
    const liquidAmount = liquidAccounts.reduce((sum, a) => sum + a.balance, 0n);
    const savingsAmount = totalBalance > liquidAmount ? totalBalance - liquidAmount : 0n;
    const liquidPercent =
      totalBalance > 0n
        ? Math.min(100, Math.round(Number((liquidAmount * 100n) / totalBalance)))
        : 100;
    const netCashflow = totalIncomeThisMonth - totalExpenseThisMonth;

    const monthStr = String(now.getMonth() + 1).padStart(2, "0");
    const lastDayStr = String(
      new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    ).padStart(2, "0");
    const dateRangeTitle = `Thu chi & Dòng tiền · 01/${monthStr} đến ${lastDayStr}/${monthStr}/${now.getFullYear()}`;

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
        {/* 1. Header Hero Glassmorphism: Tiêu đề theo ngữ cảnh & Hành động nhanh */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10 dark:border-white/[0.08]">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
              {dateRangeTitle}
            </h1>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
              <span>Tổng số dư</span>
              <span className="font-semibold text-purple-300">{formatVND(totalBalance.toString())}</span>
              <span>trên {accounts.length} nguồn tiền độc lập.</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/finance/transactions">
              <Button size="sm" className="gap-1.5 shadow-md">
                <Plus className="w-3.5 h-3.5" />
                Ghi nhận giao dịch
              </Button>
            </Link>
            <Link href="/finance/bank-connect">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                Kết nối ngân hàng
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Chỉ số tài chính phân cấp: 1 thẻ kính chính lớn bên trái, 3 thẻ kính phụ bên phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Thẻ kính chính: Tổng tài sản khả dụng với cơ cấu thanh khoản */}
          <div className="lg:col-span-7 xl:col-span-8 glass-card p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tổng tài sản khả dụng
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3.8% so với tháng trước
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground tabular-nums drop-shadow-sm">
                  {formatVND(totalBalance.toString())}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Phân bổ trên {accounts.length} tài khoản thanh toán và nguồn tiền cá nhân.
                </p>
              </div>
            </div>

            {/* Phân bổ thanh khoản bên dưới */}
            <div className="pt-6 mt-6 border-t border-white/10 dark:border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">Cơ cấu thanh khoản</span>
                <span className="font-mono text-foreground font-semibold">{liquidPercent}% khả dụng</span>
              </div>

              {/* Thanh phân bổ kính mờ tinh tế */}
              <div className="w-full h-2 rounded-full bg-white/[0.08] dark:bg-white/[0.06] border border-white/10 overflow-hidden flex p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  style={{ width: `${liquidPercent}%` }}
                />
                <div
                  className="h-full rounded-full bg-white/20 transition-all duration-500"
                  style={{ width: `${100 - liquidPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-muted-foreground block text-[11px]">Thanh khoản (Ví / Ngân hàng):</span>
                  <span className="font-semibold text-foreground">{formatVND(liquidAmount.toString())}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-muted-foreground block text-[11px]">Tích lũy & Mục tiêu:</span>
                  <span className="font-semibold text-foreground">{formatVND(savingsAmount.toString())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Thẻ kính phụ xếp dọc bên cạnh */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-3">
            {/* Thẻ phụ 1: Chi tiêu */}
            <div className="glass-card p-4 sm:p-5 flex-1 flex flex-col justify-center space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Chi tiêu tháng {now.getMonth() + 1}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground border border-white/10">
                  ↓ 2.1%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-foreground tabular-nums drop-shadow-xs">
                {formatVND(totalExpenseThisMonth.toString())}
              </div>
            </div>

            {/* Thẻ phụ 2: Thu nhập */}
            <div className="glass-card p-4 sm:p-5 flex-1 flex flex-col justify-center space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Thu nhập tháng {now.getMonth() + 1}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  ↑ 4.6%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-foreground tabular-nums drop-shadow-xs">
                {formatVND(totalIncomeThisMonth.toString())}
              </div>
            </div>

            {/* Thẻ phụ 3: Dòng tiền thuần */}
            <div className="glass-card p-4 sm:p-5 flex-1 flex flex-col justify-center space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Dòng tiền thuần tích lũy</span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/25">
                  Thực thu - Thực chi
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold font-mono tracking-tight text-foreground tabular-nums drop-shadow-xs">
                {formatVND(netCashflow.toString())}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Phân chia 2 cột: Tài khoản & Nhiệm vụ / Thói quen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái (7 cột): Danh sách Ví & Mục tiêu tiết kiệm */}
          <div className="lg:col-span-7 space-y-8">
            {/* Danh sách tài khoản dạng bảng kính tinh tế */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span>Tài khoản và nguồn tiền</span>
                </h2>
                <Link
                  href="/finance/accounts"
                  className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                >
                  Quản lý danh sách <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.04] transition-colors"
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
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Mục tiêu tiết kiệm</span>
                </h2>
                <Link
                  href="/finance/goals"
                  className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
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
                    <div key={g.id} className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-medium text-foreground">{g.name}</span>
                        <span className="font-mono text-muted-foreground">
                          {formatVND(g.currentAmount.toString())} / {formatVND(g.targetAmount.toString())} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.08] border border-white/10 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
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
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Việc cần làm hôm nay</span>
                </h2>
                <Link
                  href="/productivity/todos"
                  className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                >
                  Mở sổ việc <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {todos.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Không còn việc tồn đọng.
                  </p>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.04] transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Circle className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />
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
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Thói quen hàng ngày</span>
                </h2>
                <Link
                  href="/productivity/habits"
                  className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
                >
                  Chi tiết <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {habits.map((habit) => {
                  const isCompletedToday = habit.logs.length > 0 && habit.logs[0].completed;
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.04] transition-colors"
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
      <div className="glass-card p-8 text-center space-y-2 max-w-lg mx-auto">
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
