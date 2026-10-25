import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Sinh khóa TOTP bí mật
    const secret = authenticator.generateSecret();
    const serviceName = "MyHub Personal";
    const otpauthUrl = authenticator.keyuri(user.email, serviceName, secret);

    // Tạo mã QR dạng Data URL Base64
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Sinh 8 mã dự phòng (Backup codes) ngẫu nhiên (dạng XXXX-XXXX)
    const rawBackupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];

    for (let i = 0; i < 8; i++) {
      const code = `${crypto.randomBytes(2).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
      rawBackupCodes.push(code);
      const hashed = crypto.createHash("sha256").update(code).digest("hex");
      hashedBackupCodes.push(hashed);
    }

    // Lưu khóa bí mật (được mã hóa AES-256-GCM) vào database
    const encryptedSecret = encrypt(secret);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      secret, // Hiển thị để người dùng nhập thủ công vào Google Authenticator
      backupCodes: rawBackupCodes,
    });
  } catch (error: any) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json(
      { error: "Không thể thiết lập 2FA: " + (error.message || "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
