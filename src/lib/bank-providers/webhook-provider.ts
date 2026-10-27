import crypto from "crypto";
import { BankProvider, BankProviderVerificationResult, NormalizedTransaction } from "./types";

/**
 * So sánh an toàn chống tấn công Timing Attacks (Constant-Time String Comparison)
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export class SePayWebhookProvider implements BankProvider {
  name = "SEPAY";

  async verifySignature(
    headers: Headers,
    _rawBody: string,
    secretKey: string
  ): Promise<BankProviderVerificationResult> {
    const authHeader = headers.get("authorization") || headers.get("x-api-key");
    if (!authHeader) {
      return { isValid: false, error: "Thiếu tiêu đề Authorization / X-API-Key" };
    }

    const cleanToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!timingSafeEqualStr(cleanToken, secretKey)) {
      return { isValid: false, error: "API Key hoặc Token SePay không khớp" };
    }

    return { isValid: true };
  }

  normalizePayload(payload: any): NormalizedTransaction[] {
    if (!payload) return [];

    // SePay single transaction payload: { id, gateway, transactionDate, accountNumber, transferType, transferAmount, content }
    const rawList = Array.isArray(payload) ? payload : [payload];

    return rawList.map((item: any) => {
      const isOut = item.transferType === "out" || item.type === "OUT";
      const amount = BigInt(Math.abs(parseInt(item.transferAmount || item.amount || "0", 10)));

      return {
        externalTxId: String(item.id || item.transactionNumber || `SEPAY_${Date.now()}`),
        amount,
        type: isOut ? "EXPENSE" : "INCOME",
        date: item.transactionDate ? new Date(item.transactionDate) : new Date(),
        description: item.content || item.description || "",
        bankCode: item.gateway || item.bankCode || null,
        accountNumber: item.accountNumber || null,
        rawPayload: item,
      };
    });
  }
}

export class CassoWebhookProvider implements BankProvider {
  name = "CASSO";

  async verifySignature(
    headers: Headers,
    rawBody: string,
    secretKey: string
  ): Promise<BankProviderVerificationResult> {
    const signature = headers.get("secure-token") || headers.get("x-casso-signature");
    if (!signature) {
      return { isValid: false, error: "Thiếu chữ ký / Secure Token từ Casso" };
    }

    // Nếu secretKey khớp trực tiếp với Secure Token của Casso
    if (timingSafeEqualStr(signature, secretKey)) {
      return { isValid: true };
    }

    // Hoặc tính HMAC-SHA256 nếu cấu hình HMAC
    const computedHmac = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("hex");

    if (timingSafeEqualStr(computedHmac, signature)) {
      return { isValid: true };
    }

    return { isValid: false, error: "Chữ ký webhook Casso không hợp lệ" };
  }

  normalizePayload(payload: any): NormalizedTransaction[] {
    // Casso payload: { error: 0, data: [ { id, tid, description, amount, cusum_balance, when, bank_sub_acc_id } ] }
    const dataList = payload?.data || (Array.isArray(payload) ? payload : []);

    return dataList.map((item: any) => {
      const rawAmt = parseInt(item.amount || "0", 10);
      const isExpense = rawAmt < 0;

      return {
        externalTxId: String(item.tid || item.id || `CASSO_${Date.now()}`),
        amount: BigInt(Math.abs(rawAmt)),
        type: isExpense ? "EXPENSE" : "INCOME",
        date: item.when ? new Date(item.when) : new Date(),
        description: item.description || "",
        bankCode: item.bank_name || null,
        accountNumber: item.bank_sub_acc_id || null,
        rawPayload: item,
      };
    });
  }
}

export const bankProvidersRegistry: Record<string, BankProvider> = {
  sepay: new SePayWebhookProvider(),
  casso: new CassoWebhookProvider(),
};
