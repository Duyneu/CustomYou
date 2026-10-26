import { prisma } from "../src/lib/prisma";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { encrypt } from "../src/lib/crypto";

async function main() {
  const email = "admin@example.com";
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    console.error("Không tìm thấy người dùng:", email);
    process.exit(1);
  }

  // Tạo secret mới theo chuẩn RFC 6238
  const secret = authenticator.generateSecret();
  const serviceName = "MyHub Personal";
  const otpauthUrl = authenticator.keyuri(email, serviceName, secret);

  // Sinh 8 mã dự phòng (Backup codes) ngẫu nhiên
  const rawBackupCodes: string[] = [];
  const hashedBackupCodes: string[] = [];

  for (let i = 0; i < 8; i++) {
    const code = `${crypto.randomBytes(2).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    rawBackupCodes.push(code);
    const hashed = crypto.createHash("sha256").update(code).digest("hex");
    hashedBackupCodes.push(hashed);
  }

  // Mã hóa bí mật AES-256-GCM
  const encryptedSecret = encrypt(secret);

  // Cập nhật vào DB
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: encryptedSecret,
      twoFactorBackupCodes: hashedBackupCodes,
      twoFactorEnabled: false, // Để false cho đến khi người dùng nhập mã 6 số xác nhận đầu tiên
    },
  });

  // Xuất file ảnh QR code PNG vào Artifact Directory
  const artifactDir = "C:\\Users\\huudu\\.gemini\\antigravity\\brain\\d66c86a6-d0ed-42ff-8102-947e7e25d909";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const qrFilePath = path.join(artifactDir, "myhub_2fa_qr.png");
  await QRCode.toFile(qrFilePath, otpauthUrl, {
    width: 320,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  // Cũng tạo file QR code dạng SVG/DataURL nếu cần
  const dataUrl = await QRCode.toDataURL(otpauthUrl);

  console.log("=== THIẾT LẬP 2FA MỚI THÀNH CÔNG ===");
  console.log("Email:", email);
  console.log("Secret Key (nhập thủ công):", secret);
  console.log("OTPAuth URL:", otpauthUrl);
  console.log("QR Image Path:", qrFilePath);
  console.log("Backup Codes:", JSON.stringify(rawBackupCodes));
  console.log("====================================");
}

main()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
