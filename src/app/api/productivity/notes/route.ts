import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, tags, isPinned } = body;

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title: title || "Ghi chú không tên",
        content: content || "",
        tags: tags || [],
        isPinned: !!isPinned,
      },
    });

    return NextResponse.json({ note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi tạo ghi chú" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, content, isPinned } = body;

    const note = await prisma.note.update({
      where: { id, userId: session.user.id },
      data: {
        title,
        content,
        isPinned,
      },
    });

    return NextResponse.json({ note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi cập nhật ghi chú" }, { status: 500 });
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

  await prisma.note.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ message: "Đã xóa ghi chú" });
}
