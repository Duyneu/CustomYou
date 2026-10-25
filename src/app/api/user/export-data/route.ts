import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    user,
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    debts,
    rules,
    todos,
    habits,
    notes,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    }),
    prisma.account.findMany({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.savingsGoal.findMany({ where: { userId } }),
    prisma.debtLoan.findMany({ where: { userId } }),
    prisma.autoClassificationRule.findMany({ where: { userId } }),
    prisma.todo.findMany({ where: { userId } }),
    prisma.habit.findMany({ where: { userId }, include: { logs: true } }),
    prisma.note.findMany({ where: { userId } }),
  ]);

  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      compliance: "Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân",
      system: "MyHub Personal Workspace",
    },
    user,
    accounts: accounts.map((a) => ({
      ...a,
      balance: a.balance.toString(),
      initialBalance: a.initialBalance.toString(),
      encryptedAccountNum: undefined,
    })),
    transactions: transactions.map((t) => ({
      ...t,
      amount: t.amount.toString(),
    })),
    categories,
    budgets: budgets.map((b) => ({
      ...b,
      limitAmount: b.limitAmount.toString(),
    })),
    goals: goals.map((g) => ({
      ...g,
      targetAmount: g.targetAmount.toString(),
      currentAmount: g.currentAmount.toString(),
    })),
    debts: debts.map((d) => ({
      ...d,
      totalAmount: d.totalAmount.toString(),
      paidAmount: d.paidAmount.toString(),
    })),
    rules,
    todos,
    habits,
    notes,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="myhub_data_export_${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
