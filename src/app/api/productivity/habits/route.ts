import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      logs: {
        where: { date: todayStr },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ habits, todayStr });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "checkin") {
      const { habitId } = body;
      const todayStr = new Date().toISOString().split("T")[0];

      const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: session.user.id },
        include: { logs: { where: { date: todayStr } } },
      });

      if (!habit) return NextResponse.json({ error: "Thói quen không tồn tại" }, { status: 404 });

      const alreadyDone = habit.logs.length > 0 && habit.logs[0].completed;

      if (alreadyDone) {
        // Hủy checkin
        await prisma.habitLog.deleteMany({
          where: { habitId, date: todayStr },
        });
        const updated = await prisma.habit.update({
          where: { id: habitId },
          data: {
            currentStreak: { decrement: 1 },
          },
        });
        return NextResponse.json({ habit: updated, checked: false });
      } else {
        // Ghi nhận hoàn thành hôm nay
        await prisma.habitLog.create({
          data: {
            habitId,
            date: todayStr,
            completed: true,
          },
        });
        const newStreak = habit.currentStreak + 1;
        const updated = await prisma.habit.update({
          where: { id: habitId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(habit.longestStreak, newStreak),
          },
        });
        return NextResponse.json({ habit: updated, checked: true });
      }
    }

    // Tạo mới habit
    const { name, frequency, icon } = body;
    if (!name) return NextResponse.json({ error: "Tên thói quen là bắt buộc" }, { status: 400 });

    const habit = await prisma.habit.create({
      data: {
        userId: session.user.id,
        name,
        frequency: frequency || "DAILY",
        icon,
      },
    });

    return NextResponse.json({ habit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi xử lý thói quen" }, { status: 500 });
  }
}
