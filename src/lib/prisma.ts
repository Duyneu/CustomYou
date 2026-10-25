import { PrismaClient } from "@prisma/client";

// Mở rộng prototype của BigInt để JSON.stringify không bị ném ngoại lệ TypeError: Do not know how to serialize a BigInt
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
