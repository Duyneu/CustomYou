import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bankProvidersRegistry } from "@/lib/bank-providers/webhook-provider";
import { matchAutoCategory, RuleDefinition } from "@/lib/services/rules-engine";
import { decrypt } from "@/lib/crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const providerKey = params.provider.toLowerCase();
  const provider = bankProvidersRegistry[providerKey];

  if (!provider) {
    return NextResponse.json(
      { error: `Provider '${params.provider}' không được hỗ trợ.` },
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    return NextResponse.json({ error: "Payload không đúng định dạng JSON" }, { status: 400 });
  }

  // 1. Tìm cấu hình provider tương ứng trong DB hoặc lấy fallback từ biến môi trường
  const providerConfig = await prisma.bankProviderConfig.findFirst({
    where: {
      providerType: providerKey === "sepay" ? "SEPAY_WEBHOOK" : "CASSO_WEBHOOK",
      isActive: true,
    },
    include: { user: true },
  });

  // Xác định user sở hữu webhook (trong mô hình single-user, nếu chưa tạo config thì lấy user đầu tiên)
  let user = providerConfig?.user;
  if (!user) {
    user = (await prisma.user.findFirst()) || undefined;
  }

  if (!user) {
    return NextResponse.json({ error: "Chưa cấu hình tài khoản chủ hệ thống" }, { status: 500 });
  }

  const secretKey = providerConfig?.encryptedSecretKey
    ? decrypt(providerConfig.encryptedSecretKey)
    : process.env.BANK_WEBHOOK_SECRET;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Webhook Secret chưa được cấu hình trên hệ thống." },
      { status: 500 }
    );
  }

  // 2. Xác thực chữ ký / API Token
  const authResult = await provider.verifySignature(req.headers, rawBody, secretKey);
  if (!authResult.isValid) {
    await prisma.webhookAuditLog.create({
      data: {
        userId: user.id,
        providerConfigId: providerConfig?.id || null,
        providerName: provider.name,
        endpointCalled: `/api/webhooks/bank/${providerKey}`,
        ipAddress: req.ip || req.headers.get("x-forwarded-for") || "unknown",
        headers: Object.fromEntries(req.headers.entries()),
        rawPayload: rawBody,
        status: "INVALID_AUTH",
        errorMessage: authResult.error || "Chữ ký xác thực không hợp lệ",
      },
    });

    return NextResponse.json({ error: authResult.error || "Xác thực không thành công" }, { status: 401 });
  }

  // 3. Chuẩn hóa payload
  const normalizedList = provider.normalizePayload(payload);
  if (normalizedList.length === 0) {
    return NextResponse.json({ message: "Không có giao dịch nào trong payload" }, { status: 200 });
  }

  // 4. Lấy danh sách rules để tự động phân loại
  const activeRules = await prisma.autoClassificationRule.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { priority: "desc" },
  });

  // 5. Lấy tài khoản ngân hàng tương ứng để gán tiền
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isActive: true },
  });

  const defaultAccount = accounts.find((a) => a.type === "BANK") || accounts[0];

  let processedCount = 0;
  let duplicateCount = 0;

  for (const item of normalizedList) {
    // Chống trùng lặp (Idempotent check)
    const existingTx = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        externalTxId: item.externalTxId,
      },
    });

    if (existingTx) {
      duplicateCount++;
      await prisma.webhookAuditLog.create({
        data: {
          userId: user.id,
          providerConfigId: providerConfig?.id || null,
          providerName: provider.name,
          endpointCalled: `/api/webhooks/bank/${providerKey}`,
          headers: Object.fromEntries(req.headers.entries()),
          rawPayload: JSON.stringify(item.rawPayload),
          status: "DUPLICATE",
          transactionId: existingTx.id,
          errorMessage: `Giao dịch ${item.externalTxId} đã tồn tại trong hệ thống.`,
        },
      });
      continue;
    }

    // Tìm tài khoản phù hợp theo số tài khoản hoặc ngân hàng
    let targetAccount = defaultAccount;
    if (item.accountNumber) {
      const matchedAcc = accounts.find((a) =>
        a.accountNumberMasked?.endsWith(item.accountNumber!.slice(-4))
      );
      if (matchedAcc) targetAccount = matchedAcc;
    }

    if (!targetAccount) {
      continue;
    }

    // Tự động phân loại danh mục
    const matchedCategoryId = matchAutoCategory(
      {
        description: item.description,
        amount: item.amount,
        bankCode: item.bankCode || targetAccount.bankCode,
      },
      activeRules as RuleDefinition[]
    );

    // Ghi nhận giao dịch và cập nhật số dư trong transaction
    await prisma.$transaction(async (txClient) => {
      const created = await txClient.transaction.create({
        data: {
          userId: user!.id,
          accountId: targetAccount.id,
          categoryId: matchedCategoryId,
          amount: item.amount,
          type: item.type,
          date: item.date,
          note: item.description,
          source: "WEBHOOK",
          externalTxId: item.externalTxId,
          providerConfigId: providerConfig?.id || null,
          rawPayload: item.rawPayload,
        },
      });

      if (item.type === "INCOME") {
        await txClient.account.update({
          where: { id: targetAccount.id },
          data: { balance: { increment: item.amount } },
        });
      } else {
        await txClient.account.update({
          where: { id: targetAccount.id },
          data: { balance: { decrement: item.amount } },
        });
      }

      await txClient.webhookAuditLog.create({
        data: {
          userId: user!.id,
          providerConfigId: providerConfig?.id || null,
          providerName: provider.name,
          endpointCalled: `/api/webhooks/bank/${providerKey}`,
          headers: Object.fromEntries(req.headers.entries()),
          rawPayload: JSON.stringify(item.rawPayload),
          status: "SUCCESS",
          transactionId: created.id,
        },
      });
    });

    processedCount++;
  }

  return NextResponse.json({
    success: true,
    processed: processedCount,
    duplicates: duplicateCount,
    message: `Đã xử lý ${processedCount} giao dịch, bỏ qua ${duplicateCount} giao dịch trùng.`,
  });
}
