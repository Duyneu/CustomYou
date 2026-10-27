import { prisma } from "../src/lib/prisma";
import { authenticator } from "otplib";
import { decrypt } from "../src/lib/crypto";

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error("Vui lòng cung cấp mã 6 số: npx tsx scripts/verify-2fa.ts 123456");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || "").trim().toLowerCase();
  if (!email) {
    console.error("Vui lòng cấu hình DEFAULT_ADMIN_EMAIL trong .env");
    process.exit(1);
  }
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user || !user.twoFactorSecret) {
    console.error("Không tìm thấy cấu hình 2FA cho người dùng:", email);
    process.exit(1);
  }

  const decryptedSecret = decrypt(user.twoFactorSecret);
  const isValid = authenticator.verify({
    token: code.trim(),
    secret: decryptedSecret,
  });

  if (!isValid) {
    console.log(JSON.stringify({ success: false, message: "Mã 2FA không chính xác hoặc đã hết hạn" }));
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  console.log(JSON.stringify({ success: true, message: "Xác thực 2FA thành công và đã kích hoạt twoFactorEnabled: true!" }));
}

main()
  .catch((e) => {
    console.error("Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
