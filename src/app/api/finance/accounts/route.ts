import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAccountSchema } from "@/lib/validations/finance";
import { encrypt, maskAccountNumber } from "@/lib/crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const serialized = accounts.map((acc) => ({
    ...acc,
    balance: acc.balance.toString(),
    initialBalance: acc.initialBalance.toString(),
    encryptedAccountNum: undefined, // Không trả về chuỗi mã hóa cho client
  }));

  return NextResponse.json({ accounts: serialized });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createAccountSchema.parse(body);

    const initialBal = BigInt(validated.initialBalance);
    const masked = validated.accountNumber ? maskAccountNumber(validated.accountNumber) : null;
    const encryptedNum = validated.accountNumber ? encrypt(validated.accountNumber) : null;

    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        type: validated.type,
        bankCode: validated.bankCode,
        accountNumberMasked: masked,
        encryptedAccountNum: encryptedNum,
        initialBalance: initialBal,
        balance: initialBal,
        currency: validated.currency,
        color: validated.color,
        icon: validated.icon,
        isExcludedFromTotal: validated.isExcludedFromTotal,
      },
    });

    return NextResponse.json({
      account: {
        ...account,
        balance: account.balance.toString(),
        initialBalance: account.initialBalance.toString(),
        encryptedAccountNum: undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || error.message || "Không thể tạo tài khoản" },
      { status: 400 }
    );
  }
}
