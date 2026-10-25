import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations/finance";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        type: validated.type,
        icon: validated.icon,
        color: validated.color,
        parentId: validated.parentId,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || error.message || "Không thể tạo danh mục" },
      { status: 400 }
    );
  }
}
