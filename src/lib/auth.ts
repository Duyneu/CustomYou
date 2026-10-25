import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Chỉ cho phép duy nhất một chủ sở hữu truy cập hệ thống
export const ALLOWED_OWNER_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com")
  .trim()
  .toLowerCase();

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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ Email và Mật khẩu.");
        }

        const cleanEmail = credentials.email.trim().toLowerCase();

        // Kiểm soát đơn người dùng (Single-user strict gatekeeper)
        if (cleanEmail !== ALLOWED_OWNER_EMAIL) {
          throw new Error("Truy cập bị từ chối: Bảng điều khiển MyHub chỉ dành riêng cho chủ nhân.");
        }

        let user = await prisma.user.findUnique({
          where: { email: ALLOWED_OWNER_EMAIL },
        });

        // Tự động nâng cấp tài khoản cũ nếu còn lưu admin@myhub.local
        if (!user) {
          const oldAdmin = await prisma.user.findUnique({
            where: { email: "admin@myhub.local" },
          });

          if (oldAdmin) {
            const passwordHash = await bcrypt.hash(credentials.password, 12);
            user = await prisma.user.update({
              where: { id: oldAdmin.id },
              data: {
                email: ALLOWED_OWNER_EMAIL,
                name: "Hữu Duy",
                passwordHash,
              },
            });
          }
        }

        // Nếu database mới kết nối chưa có người dùng nào, tự động khởi tạo tài khoản chủ nhân
        if (!user) {
          try {
            const userCount = await prisma.user.count();
            if (userCount === 0) {
              const passwordHash = await bcrypt.hash(credentials.password, 12);
              user = await prisma.user.create({
                data: {
                  email: ALLOWED_OWNER_EMAIL,
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
          } catch (e) {
            console.error("Auto-seed owner error:", e);
          }
        }

        if (!user || !user.passwordHash) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || "Hữu Duy",
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorVerified: !user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.twoFactorVerified = user.twoFactorVerified;
      }

      // Hỗ trợ cập nhật token khi xác thực 2FA thành công
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
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.twoFactorVerified = token.twoFactorVerified as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "0000000000000000000000000000000000000000000000000000000000000000",
};
