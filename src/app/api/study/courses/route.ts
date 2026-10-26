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
    const courses = await prisma.course.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { studyLogs: true, materials: true },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("GET /api/study/courses error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách môn học" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      code,
      credits,
      instructor,
      room,
      dayOfWeek,
      startTime,
      endTime,
      color,
      targetGrade,
      totalLessons,
      completedLessons,
    } = body;

    if (!name || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên môn, thứ trong tuần và giờ học" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        userId: session.user.id,
        name,
        code: code || null,
        credits: credits ? Number(credits) : 3,
        instructor: instructor || null,
        room: room || null,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        color: color || "#8b5cf6",
        targetGrade: targetGrade || "A",
        totalLessons: totalLessons ? Number(totalLessons) : 15,
        completedLessons: completedLessons ? Number(completedLessons) : 0,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/study/courses error:", error);
    return NextResponse.json({ error: "Lỗi tạo môn học mới" }, { status: 500 });
  }
}
