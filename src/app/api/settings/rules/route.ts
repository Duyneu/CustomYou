import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRuleSchema } from "@/lib/validations/finance";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const rules = await prisma.autoClassificationRule.findMany({
    where: { userId: session.user.id },
    include: {
      targetCategory: true,
    },
    orderBy: { priority: "desc" },
  });

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createRuleSchema.parse(body);

    const rule = await prisma.autoClassificationRule.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        matchField: validated.matchField,
        operator: validated.operator,
        pattern: validated.pattern,
        targetCategoryId: validated.targetCategoryId,
        priority: validated.priority,
        isActive: validated.isActive,
      },
      include: {
        targetCategory: true,
      },
    });

    return NextResponse.json({ rule });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || error.message || "Không thể tạo quy tắc" },
      { status: 400 }
    );
  }
}
