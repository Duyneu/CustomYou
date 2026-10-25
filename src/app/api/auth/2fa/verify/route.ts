import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Vui lòng nhập mã xác thực" }, { status: 400 });
    }

    const cleanCode = code.trim();
    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Tài khoản chưa thiết lập khóa 2FA bí mật" },
        { status: 400 }
      );
    }

    const decryptedSecret = decrypt(user.twoFactorSecret);
    let isValid = authenticator.verify({
      token: cleanCode,
      secret: decryptedSecret,
    });

    let usedBackupCode = false;

    // Nếu không khớp mã TOTP 6 số, kiểm tra xem có phải mã dự phòng (Backup Code) không
    if (!isValid && user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
      const hashedInput = crypto.createHash("sha256").update(cleanCode.toUpperCase()).digest("hex");
      const codeIndex = user.twoFactorBackupCodes.indexOf(hashedInput);

      if (codeIndex !== -1) {
        isValid = true;
        usedBackupCode = true;
        // Xóa mã dự phòng đã dùng (Single-use)
        const updatedBackupCodes = [...user.twoFactorBackupCodes];
        updatedBackupCodes.splice(codeIndex, 1);

        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorBackupCodes: updatedBackupCodes },
        });
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Mã xác thực không chính xác hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    // Đánh dấu kích hoạt 2FA thành công
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    // Ghi nhật ký kiểm toán
    await prisma.auditLog.create({
      data: {
        userId,
        action: "TWO_FACTOR_VERIFY",
        details: usedBackupCode ? "Xác thực 2FA thành công bằng Mã Dự Phòng" : "Xác thực 2FA thành công qua Google Authenticator",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xác thực hai lớp (2FA) thành công!",
      twoFactorVerified: true,
    });
  } catch (error: any) {
    console.error("2FA Verify Error:", error);
    return NextResponse.json(
      { error: "Lỗi kiểm tra 2FA: " + (error.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
