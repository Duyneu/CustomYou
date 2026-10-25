import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, priority, dueDate, tags } = body;

    if (!title) {
      return NextResponse.json({ error: "Tiêu đề công việc là bắt buộc" }, { status: 400 });
    }

    const todo = await prisma.todo.create({
      data: {
        userId: session.user.id,
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        status: "TODO",
      },
    });

    return NextResponse.json({ todo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi tạo việc" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    const todo = await prisma.todo.update({
      where: { id, userId: session.user.id },
      data: {
        status,
        completedAt: status === "DONE" ? new Date() : null,
      },
    });

    return NextResponse.json({ todo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi cập nhật việc" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });

  await prisma.todo.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ message: "Đã xóa công việc" });
}
