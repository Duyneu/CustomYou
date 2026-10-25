import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

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
          name: user.name || "Chủ nhân MyHub",
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorVerified: !user.twoFactorEnabled, // Nếu không bật 2FA thì coi như đã verify
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
  secret:
    process.env.NEXTAUTH_SECRET ||
    "0000000000000000000000000000000000000000000000000000000000000000",
};
