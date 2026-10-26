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
    const materials = await prisma.studyMaterial.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
      orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(materials);
  } catch (error: any) {
    console.error("GET /api/study/materials error:", error);
    return NextResponse.json({ error: "Lỗi tải tài liệu học tập" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, title, category, urlOrPath, summary, isImportant } = body;

    if (!title) {
      return NextResponse.json({ error: "Vui lòng nhập tên tài liệu" }, { status: 400 });
    }

    const material = await prisma.studyMaterial.create({
      data: {
        userId: session.user.id,
        courseId: courseId || null,
        title,
        category: category || "SLIDE",
        urlOrPath: urlOrPath || null,
        summary: summary || null,
        isImportant: Boolean(isImportant),
      },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/study/materials error:", error);
    return NextResponse.json({ error: "Lỗi lưu tài liệu học tập" }, { status: 500 });
  }
}
