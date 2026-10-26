import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const course = await prisma.course.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.credits !== undefined && { credits: Number(body.credits) }),
        ...(body.instructor !== undefined && { instructor: body.instructor }),
        ...(body.room !== undefined && { room: body.room }),
        ...(body.dayOfWeek !== undefined && { dayOfWeek: Number(body.dayOfWeek) }),
        ...(body.startTime && { startTime: body.startTime }),
        ...(body.endTime && { endTime: body.endTime }),
        ...(body.color && { color: body.color }),
        ...(body.targetGrade !== undefined && { targetGrade: body.targetGrade }),
        ...(body.totalLessons !== undefined && { totalLessons: Number(body.totalLessons) }),
        ...(body.completedLessons !== undefined && { completedLessons: Number(body.completedLessons) }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json(course);
  } catch (error: any) {
    console.error("PATCH /api/study/courses/[id] error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật môn học" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.course.delete({
      where: { id: params.id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/study/courses/[id] error:", error);
    return NextResponse.json({ error: "Lỗi xóa môn học" }, { status: 500 });
  }
}
