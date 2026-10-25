import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Vui lòng nhập mật khẩu xác nhận" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Mật khẩu xác nhận không chính xác" }, { status: 403 });
    }

    // Xóa toàn bộ dữ liệu giao dịch, tài khoản, năng suất trong transaction
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId: user.id } }),
      prisma.budget.deleteMany({ where: { userId: user.id } }),
      prisma.savingsGoal.deleteMany({ where: { userId: user.id } }),
      prisma.debtLoan.deleteMany({ where: { userId: user.id } }),
      prisma.autoClassificationRule.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.todo.deleteMany({ where: { userId: user.id } }),
      prisma.habit.deleteMany({ where: { userId: user.id } }),
      prisma.note.deleteMany({ where: { userId: user.id } }),
      prisma.webhookAuditLog.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      message: "Đã xóa toàn bộ dữ liệu cá nhân theo yêu cầu Nghị định 13/2023/NĐ-CP.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi xóa dữ liệu" }, { status: 500 });
  }
}
