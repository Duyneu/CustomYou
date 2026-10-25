import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validations/finance";
import { matchAutoCategory, RuleDefinition } from "@/lib/services/rules-engine";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const skip = (page - 1) * limit;

  const where: any = {
    userId: session.user.id,
  };

  if (type && ["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
    where.type = type;
  }

  if (accountId) {
    where.OR = [
      { accountId },
      { targetAccountId: accountId },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.note = { contains: search, mode: "insensitive" };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, bankCode: true, type: true } },
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  const serialized = transactions.map((tx) => ({
    ...tx,
    amount: tx.amount.toString(),
  }));

  return NextResponse.json({
    transactions: serialized,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createTransactionSchema.parse(body);

    const sourceAccount = await prisma.account.findFirst({
      where: { id: validated.accountId, userId: session.user.id },
    });

    if (!sourceAccount) {
      return NextResponse.json({ error: "Tài khoản nguồn không tồn tại" }, { status: 404 });
    }

    if (validated.type === "TRANSFER") {
      if (!validated.targetAccountId) {
        return NextResponse.json(
          { error: "Vui lòng chọn tài khoản đích cho giao dịch chuyển khoản" },
          { status: 400 }
        );
      }
      if (validated.targetAccountId === validated.accountId) {
        return NextResponse.json(
          { error: "Tài khoản đích không được trùng với tài khoản nguồn" },
          { status: 400 }
        );
      }
      const targetAccount = await prisma.account.findFirst({
        where: { id: validated.targetAccountId, userId: session.user.id },
      });
      if (!targetAccount) {
        return NextResponse.json({ error: "Tài khoản đích không tồn tại" }, { status: 404 });
      }
    }

    let finalCategoryId = validated.categoryId || null;

    // Tự động phân loại nếu người dùng chưa chọn danh mục
    if (!finalCategoryId && validated.type !== "TRANSFER") {
      const activeRules = await prisma.autoClassificationRule.findMany({
        where: { userId: session.user.id, isActive: true },
        orderBy: { priority: "desc" },
      });

      const matchedCat = matchAutoCategory(
        {
          description: validated.note,
          amount: BigInt(validated.amount),
          bankCode: sourceAccount.bankCode,
        },
        activeRules as RuleDefinition[]
      );

      if (matchedCat) {
        finalCategoryId = matchedCat;
      }
    }

    const txAmount = BigInt(validated.amount);
    const txDate = new Date(validated.date);

    // Thực hiện trong Prisma Transaction đảm bảo tính toàn vẹn số dư
    const createdTx = await prisma.$transaction(async (prismaClient) => {
      // 1. Tạo bản ghi giao dịch
      const newTx = await prismaClient.transaction.create({
        data: {
          userId: session.user.id,
          accountId: validated.accountId,
          targetAccountId: validated.targetAccountId,
          categoryId: finalCategoryId,
          amount: txAmount,
          type: validated.type,
          date: txDate,
          note: validated.note,
          isExcludedFromBudget: validated.isExcludedFromBudget,
          source: "MANUAL",
        },
        include: {
          account: true,
          category: true,
        },
      });

      // 2. Cập nhật số dư tài khoản
      if (validated.type === "EXPENSE") {
        await prismaClient.account.update({
          where: { id: validated.accountId },
          data: { balance: { decrement: txAmount } },
        });
      } else if (validated.type === "INCOME") {
        await prismaClient.account.update({
          where: { id: validated.accountId },
          data: { balance: { increment: txAmount } },
        });
      } else if (validated.type === "TRANSFER" && validated.targetAccountId) {
        await prismaClient.account.update({
          where: { id: validated.accountId },
          data: { balance: { decrement: txAmount } },
        });
        await prismaClient.account.update({
          where: { id: validated.targetAccountId },
          data: { balance: { increment: txAmount } },
        });
      }

      return newTx;
    });

    return NextResponse.json({
      transaction: {
        ...createdTx,
        amount: createdTx.amount.toString(),
        account: {
          ...createdTx.account,
          balance: createdTx.account.balance.toString(),
          initialBalance: createdTx.account.initialBalance.toString(),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || error.message || "Không thể tạo giao dịch" },
      { status: 400 }
    );
  }
}
