import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchAutoCategory, RuleDefinition } from "@/lib/services/rules-engine";

interface ImportRow {
  date: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string;
  externalTxId?: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accountId, rows } = body as { accountId: string; rows: ImportRow[] };

    if (!accountId) {
      return NextResponse.json({ error: "Vui lòng chọn tài khoản đích để nhập" }, { status: 400 });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Không có dòng dữ liệu hợp lệ nào" }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    // Lấy rules tự động phân loại
    const activeRules = await prisma.autoClassificationRule.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { priority: "desc" },
    });

    let importedCount = 0;
    let duplicateCount = 0;

    await prisma.$transaction(async (txClient) => {
      for (const row of rows) {
        if (!row.amount || row.amount <= 0) continue;

        const extId = row.externalTxId || `CSV_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        // Kiểm tra chống trùng nếu có externalTxId
        if (row.externalTxId) {
          const exists = await txClient.transaction.findFirst({
            where: { userId: session.user.id, externalTxId: row.externalTxId },
          });
          if (exists) {
            duplicateCount++;
            continue;
          }
        }

        const amt = BigInt(Math.abs(row.amount));
        const matchedCat = matchAutoCategory(
          {
            description: row.note,
            amount: amt,
            bankCode: account.bankCode,
          },
          activeRules as RuleDefinition[]
        );

        await txClient.transaction.create({
          data: {
            userId: session.user.id,
            accountId: account.id,
            categoryId: matchedCat,
            amount: amt,
            type: row.type,
            date: new Date(row.date),
            note: row.note,
            source: "CSV_IMPORT",
            externalTxId: extId,
          },
        });

        if (row.type === "INCOME") {
          await txClient.account.update({
            where: { id: account.id },
            data: { balance: { increment: amt } },
          });
        } else {
          await txClient.account.update({
            where: { id: account.id },
            data: { balance: { decrement: amt } },
          });
        }

        importedCount++;
      }
    });

    return NextResponse.json({
      success: true,
      imported: importedCount,
      duplicates: duplicateCount,
      message: `Đã nhập thành công ${importedCount} giao dịch, bỏ qua ${duplicateCount} giao dịch trùng.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể nhập sao kê" },
      { status: 500 }
    );
  }
}
