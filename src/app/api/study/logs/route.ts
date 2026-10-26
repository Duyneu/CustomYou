import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.studyLog.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("GET /api/study/logs error:", error);
    return NextResponse.json({ error: "Lỗi tải nhật ký học tập" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, title, content, hoursSpent, date, homework, homeworkDue } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Vui lòng nhập tiêu đề và nội dung bài học" },
        { status: 400 }
      );
    }

    const log = await prisma.studyLog.create({
      data: {
        userId: session.user.id,
        courseId: courseId || null,
        title,
        content,
        hoursSpent: hoursSpent ? parseFloat(hoursSpent) : 1.0,
        date: date ? new Date(date) : new Date(),
        homework: homework || null,
        homeworkDue: homeworkDue ? new Date(homeworkDue) : null,
      },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
    });

    // Tự động tăng 1 buổi hoàn thành cho môn học nếu có
    if (courseId) {
      await prisma.course.update({
        where: { id: courseId },
        data: {
          completedLessons: { increment: 1 },
        },
      }).catch(() => {});
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/study/logs error:", error);
    return NextResponse.json({ error: "Lỗi lưu nhật ký học tập" }, { status: 500 });
  }
}
