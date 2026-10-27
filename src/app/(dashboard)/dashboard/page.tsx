import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/formatters";
import Link from "next/link";
import {
  GraduationCap,
  Receipt,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

import { LiveClockCard } from "@/components/dashboard/live-clock-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { TodayScheduleCard } from "@/components/dashboard/today-schedule-card";
import { TodayTodosCard } from "@/components/dashboard/today-todos-card";
import { QuickScratchpadCard } from "@/components/dashboard/quick-scratchpad-card";
import { HabitsCheckinCard } from "@/components/dashboard/habits-checkin-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    // 1. Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // 2. Lấy môn học & lịch học
    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // 3. Lấy việc cần làm (Todos)
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { priority: "desc" }],
      take: 8,
    });

    // 4. Lấy thói quen hôm nay
    const todayStr = new Date().toISOString().split("T")[0];
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: { date: todayStr },
        },
      },
    });

    const habitsFormatted = habits.map((h) => ({
      id: h.id,
      name: h.name,
      currentStreak: h.currentStreak,
      isCompletedToday: h.logs.length > 0 && h.logs[0].completed,
    }));

    // 5. Lấy ghi chú nhanh đã ghim gần nhất
    const quickNote = await prisma.note.findFirst({
      where: { userId },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      select: { id: true, title: true, content: true, updatedAt: true },
    });

    // Chuẩn hóa & serialize dữ liệu sạch để tránh lỗi Date/BigInt khi truyền sang Client Components
    const serializedCourses = courses.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      instructor: c.instructor,
      room: c.room,
      dayOfWeek: c.dayOfWeek,
      startTime: c.startTime,
      endTime: c.endTime,
      color: c.color,
      completedLessons: c.completedLessons,
      totalLessons: c.totalLessons,
    }));

    const serializedTodos = todos.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    }));

    const serializedNote = quickNote
      ? {
          id: quickNote.id,
          title: quickNote.title,
          content: quickNote.content,
          updatedAt: quickNote.updatedAt.toISOString(),
        }
      : null;

    // 6. Thống kê chi tiêu tháng phục vụ widget tóm tắt
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenseAggregate = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
    });
    const monthlyExpense = expenseAggregate._sum.amount || 0n;

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Row 1: Đồng hồ thời gian thực & Thời tiết */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <LiveClockCard userName={user?.name || "Hữu Duy"} />
          <WeatherCard />
        </div>

        {/* Row 2: Lịch học hôm nay & Danh sách việc cần làm */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <TodayScheduleCard initialCourses={serializedCourses} />
          </div>
          <div className="lg:col-span-5">
            <TodayTodosCard initialTodos={serializedTodos} />
          </div>
        </div>

        {/* Row 3: Ghi chú nhanh & Điểm danh thói quen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <QuickScratchpadCard initialNote={serializedNote} />
          <HabitsCheckinCard initialHabits={habitsFormatted} />
        </div>

        {/* Dải điều hướng nhanh & Tóm tắt chỉ số cá nhân */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Môn học & Tiến độ */}
          <Link
            href="/study"
            className="glass-card p-4 flex items-center justify-between group hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Nhật ký học tập</span>
                <span className="text-sm font-semibold text-foreground">
                  {courses.length} Môn học kỳ này
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Theo dõi chi tiêu & thói quen */}
          <Link
            href="/tracker"
            className="glass-card p-4 flex items-center justify-between group hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Theo dõi chi tiêu</span>
                <span className="text-sm font-semibold font-mono text-foreground">
                  {formatVND(monthlyExpense.toString())}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Xây dựng kỷ luật & Streak */}
          <Link
            href="/productivity/habits"
            className="glass-card p-4 flex items-center justify-between group hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Kỷ luật thói quen</span>
                <span className="text-sm font-semibold text-foreground">
                  {habits.length} Thói quen duy trì
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="glass-card p-8 text-center space-y-2 max-w-lg mx-auto">
        <h2 className="text-sm font-semibold text-foreground">Đang tải bảng điều khiển cá nhân</h2>
        <p className="text-xs text-muted-foreground">
          Vui lòng đợi giây lát để hệ thống cập nhật dữ liệu.
        </p>
      </div>
    );
  }
}
