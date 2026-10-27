import { describe, it, expect } from "vitest";
import { SePayWebhookProvider, CassoWebhookProvider } from "../../src/lib/bank-providers/webhook-provider";
import crypto from "crypto";

describe("Webhook Signature Verification (Timing-Safe)", () => {
  const sepay = new SePayWebhookProvider();
  const casso = new CassoWebhookProvider();
  const secretKey = "test_webhook_super_secret_key_12345";

  describe("SePay Provider", () => {
    it("chấp nhận Authorization Bearer token hợp lệ", async () => {
      const headers = new Headers({
        authorization: `Bearer ${secretKey}`,
      });
      const result = await sepay.verifySignature(headers, "{}", secretKey);
      expect(result.isValid).toBe(true);
    });

    it("chấp nhận x-api-key header hợp lệ", async () => {
      const headers = new Headers({
        "x-api-key": secretKey,
      });
      const result = await sepay.verifySignature(headers, "{}", secretKey);
      expect(result.isValid).toBe(true);
    });

    it("từ chối khi thiếu token", async () => {
      const headers = new Headers();
      const result = await sepay.verifySignature(headers, "{}", secretKey);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Thiếu tiêu đề");
    });

    it("từ chối token không khớp", async () => {
      const headers = new Headers({
        authorization: "Bearer wrong_token_value",
      });
      const result = await sepay.verifySignature(headers, "{}", secretKey);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("không khớp");
    });
  });

  describe("Casso Provider", () => {
    it("chấp nhận secure-token khớp trực tiếp", async () => {
      const headers = new Headers({
        "secure-token": secretKey,
      });
      const result = await casso.verifySignature(headers, "{}", secretKey);
      expect(result.isValid).toBe(true);
    });

    it("chấp nhận HMAC-SHA256 signature hợp lệ", async () => {
      const payload = JSON.stringify({ data: [{ id: 1, amount: 50000 }] });
      const hmac = crypto.createHmac("sha256", secretKey).update(payload).digest("hex");
      const headers = new Headers({
        "x-casso-signature": hmac,
      });
      const result = await casso.verifySignature(headers, payload, secretKey);
      expect(result.isValid).toBe(true);
    });

    it("từ chối HMAC-SHA256 sai", async () => {
      const payload = JSON.stringify({ data: [{ id: 1, amount: 50000 }] });
      const headers = new Headers({
        "x-casso-signature": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
      });
      const result = await casso.verifySignature(headers, payload, secretKey);
      expect(result.isValid).toBe(false);
    });
  });
});
