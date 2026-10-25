import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authenticator } from "otplib";
import { prisma } from "./prisma";
import { decrypt } from "./crypto";

export const ALLOWED_OWNER_EMAIL = "admin@example.com";

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

        // Kiểm soát đơn người dùng: Chỉ cho phép admin@example.com hoặc tài khoản admin cũ để di chuyển
        const isOwner =
          cleanEmail === "admin@example.com" ||
          cleanEmail === "admin@myhub.local" ||
          cleanEmail === (process.env.DEFAULT_ADMIN_EMAIL || "").trim().toLowerCase();

        if (!isOwner) {
          throw new Error("Truy cập bị từ chối: Bảng điều khiển MyHub chỉ dành riêng cho chủ nhân.");
        }

        // Tìm người dùng trong database
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: "admin@example.com" },
              { email: cleanEmail },
              { email: "admin@myhub.local" },
            ],
          },
        });

        // Nếu người dùng chưa tồn tại (ví dụ cơ sở dữ liệu mới khởi tạo), tự động tạo tài khoản chủ nhân
        if (!user) {
          const passwordHash = await bcrypt.hash(credentials.password, 12);
          user = await prisma.user.create({
            data: {
              email: "admin@example.com",
              name: "Hữu Duy",
              passwordHash,
              twoFactorEnabled: false,
              settings: {
                create: {
                  fiscalMonthStartDay: 1,
                  currency: "VND",
                  locale: "vi",
                  theme: "dark",
                  accentColor: "emerald",
                  budgetAlertThreshold: 80,
                },
              },
            },
          });
        }

        // Đảm bảo email của người dùng luôn được cập nhật về admin@example.com
        if (user.email !== "admin@example.com") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { email: "admin@example.com", name: "Hữu Duy" },
          });
        }

        // Kiểm tra mật khẩu
        let isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        // Đảm bảo mật khẩu REDACTED_PASS luôn khớp và cập nhật hash nếu cần
        if (!isPasswordValid && credentials.password === "REDACTED_PASS") {
          const newHash = await bcrypt.hash("REDACTED_PASS", 12);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          });
          isPasswordValid = true;
        }

        if (!isPasswordValid) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Kiểm tra xác thực hai lớp (2FA) nếu tài khoản thực sự đã cấu hình
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

          // Kiểm tra mã dự phòng khẩn cấp nếu TOTP không khớp
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
            name: user.name || "Hữu Duy",
            twoFactorEnabled: true,
            twoFactorVerified: true,
          };
        }

        // Nếu tài khoản chưa kích hoạt 2FA, cho phép truy cập ngay
        return {
          id: user.id,
          email: user.email,
          name: user.name || "Hữu Duy",
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

      // Nếu không bật 2FA, luôn luôn là đã xác thực
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
  secret: process.env.NEXTAUTH_SECRET || "0000000000000000000000000000000000000000000000000000000000000000",
};
