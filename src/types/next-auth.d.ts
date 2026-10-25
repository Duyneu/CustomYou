import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    twoFactorEnabled: boolean;
    twoFactorVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      twoFactorEnabled: boolean;
      twoFactorVerified?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    twoFactorEnabled: boolean;
    twoFactorVerified?: boolean;
  }
}
