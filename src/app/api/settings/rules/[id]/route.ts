import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const rule = await prisma.autoClassificationRule.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json({ error: "Quy tắc không tồn tại" }, { status: 404 });
    }

    const updated = await prisma.autoClassificationRule.update({
      where: { id: params.id },
      data: {
        name: body.name ?? rule.name,
        pattern: body.pattern ?? rule.pattern,
        targetCategoryId: body.targetCategoryId ?? rule.targetCategoryId,
        priority: body.priority ?? rule.priority,
        isActive: body.isActive !== undefined ? body.isActive : rule.isActive,
      },
      include: {
        targetCategory: true,
      },
    });

    return NextResponse.json({ rule: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể cập nhật quy tắc" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const rule = await prisma.autoClassificationRule.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json({ error: "Quy tắc không tồn tại" }, { status: 404 });
    }

    await prisma.autoClassificationRule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Đã xóa quy tắc thành công" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể xóa quy tắc" },
      { status: 500 }
    );
  }
}
