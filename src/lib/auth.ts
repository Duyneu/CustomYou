import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authenticator } from "otplib";
import { prisma } from "./prisma";
import { decrypt } from "./crypto";

// Lấy email chủ hệ thống từ biến môi trường
export function getAllowedOwnerEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.DEFAULT_ADMIN_EMAIL ||
    ""
  ).trim().toLowerCase();
}

// -------------------------------------------------------------
// Rate Limiting đăng nhập để chống tấn công Brute-force
// -------------------------------------------------------------
interface RateLimitRecord {
  attempts: number;
  lockUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 phút

function checkRateLimit(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (record && record.lockUntil > now) {
    const minutesRemaining = Math.ceil((record.lockUntil - now) / 60000);
    throw new Error(
      `Tài khoản tạm thời bị khóa do nhiều lần đăng nhập không hợp lệ. Vui lòng thử lại sau ${minutesRemaining} phút.`
    );
  }
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0, lockUntil: 0 };

  if (record.lockUntil <= now && record.attempts >= MAX_ATTEMPTS) {
    record.attempts = 0;
    record.lockUntil = 0;
  }

  record.attempts += 1;
  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCK_TIME_MS;
  }
  loginAttempts.set(key, record);
}

function resetFailedAttempts(key: string): void {
  loginAttempts.delete(key);
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Tài khoản & Mật khẩu",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
        code: { label: "Mã 2FA", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ Email và Mật khẩu.");
        }

        const cleanEmail = credentials.email.trim().toLowerCase();
        const rateLimitKey = `login_${cleanEmail}`;

        // Kiểm tra Brute-Force Rate Limit
        checkRateLimit(rateLimitKey);

        // Kiểm tra danh tính chủ hệ thống nếu có cấu hình email chủ
        const ownerEmail = getAllowedOwnerEmail();
        if (ownerEmail && cleanEmail !== ownerEmail) {
          recordFailedAttempt(rateLimitKey);
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Tìm người dùng trong database theo đúng email đã nhập
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        // Nếu người dùng không tồn tại, trả lỗi chung để tránh user enumeration
        if (!user) {
          recordFailedAttempt(rateLimitKey);
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Kiểm tra mật khẩu thuần túy bằng bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          recordFailedAttempt(rateLimitKey);
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Reset bộ đếm brute-force khi mật khẩu chính xác
        resetFailedAttempts(rateLimitKey);

        // Kiểm tra xác thực hai lớp (2FA) nếu tài khoản thực sự đã kích hoạt
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const code = credentials.code?.trim();
          if (!code) {
            throw new Error("2FA_REQUIRED");
          }

          let isValid2FA = false;
          try {
            const decryptedSecret = decrypt(user.twoFactorSecret);
            isValid2FA = authenticator.verify({ token: code, secret: decryptedSecret });
          } catch (e) {
            isValid2FA = false;
          }

          // Kiểm tra mã dự phòng (Backup Code) nếu TOTP không khớp
          if (!isValid2FA && user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
            const hashedInput = crypto.createHash("sha256").update(code.toUpperCase()).digest("hex");
            const codeIndex = user.twoFactorBackupCodes.indexOf(hashedInput);
            if (codeIndex !== -1) {
              isValid2FA = true;
              const updatedBackupCodes = [...user.twoFactorBackupCodes];
              updatedBackupCodes.splice(codeIndex, 1);
              await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorBackupCodes: updatedBackupCodes },
              });
            }
          }

          if (!isValid2FA) {
            throw new Error("Mã xác thực 2FA không chính xác hoặc đã hết hạn.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "Chủ tài khoản",
            twoFactorEnabled: true,
            twoFactorVerified: true,
          };
        }

        // Nếu tài khoản chưa kích hoạt 2FA, cho phép truy cập ngay
        return {
          id: user.id,
          email: user.email,
          name: user.name || "Chủ tài khoản",
          twoFactorEnabled: false,
          twoFactorVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.twoFactorEnabled = !!user.twoFactorEnabled;
        token.twoFactorVerified = !!user.twoFactorVerified;
      }

      if (!token.twoFactorEnabled) {
        token.twoFactorVerified = true;
      }

      if (trigger === "update" && session) {
        if (typeof session.twoFactorVerified === "boolean") {
          token.twoFactorVerified = session.twoFactorVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.twoFactorEnabled = !!token.twoFactorEnabled;
        session.user.twoFactorVerified = token.twoFactorEnabled ? !!token.twoFactorVerified : true;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
