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
    const log = await prisma.studyLog.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...(body.isHomeworkDone !== undefined && { isHomeworkDone: Boolean(body.isHomeworkDone) }),
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(body.hoursSpent !== undefined && { hoursSpent: parseFloat(body.hoursSpent) }),
      },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
    });

    return NextResponse.json(log);
  } catch (error: any) {
    console.error("PATCH /api/study/logs/[id] error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật nhật ký" }, { status: 500 });
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
    await prisma.studyLog.delete({
      where: { id: params.id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/study/logs/[id] error:", error);
    return NextResponse.json({ error: "Lỗi xóa nhật ký" }, { status: 500 });
  }
}
