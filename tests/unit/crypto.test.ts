import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt, maskAccountNumber } from "../../src/lib/crypto";

describe("Crypto Module (AES-256-GCM)", () => {
  beforeAll(() => {
    process.env.ENCRYPTION_MASTER_KEY =
      "1111111111111111111111111111111111111111111111111111111111111111";
  });

  it("mã hóa và giải mã chính xác chuỗi bí mật", () => {
    const rawSecret = "sepay_sk_live_secret_token_123456789";
    const encrypted = encrypt(rawSecret);

    expect(encrypted).not.toBe(rawSecret);
    expect(encrypted.split(":")).toHaveLength(3); // iv:tag:ciphertext

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(rawSecret);
  });

  it("mã hóa cùng một chuỗi 2 lần sinh ra 2 ciphertext khác nhau (ngẫu nhiên IV)", () => {
    const text = "casso_api_key_secret";
    const enc1 = encrypt(text);
    const enc2 = encrypt(text);

    expect(enc1).not.toBe(enc2);
    expect(decrypt(enc1)).toBe(text);
    expect(decrypt(enc2)).toBe(text);
  });

  it("báo lỗi nếu ciphertext bị chỉnh sửa (Message Tampering detection)", () => {
    const encrypted = encrypt("my_sensitive_data");
    const parts = encrypted.split(":");
    // Sửa đổi ciphertext
    const tampered = `${parts[0]}:${parts[1]}:${parts[2].slice(0, -2)}aa`;

    expect(() => decrypt(tampered)).toThrow();
  });

  it("che dấu số tài khoản chỉ để lộ 4 số cuối", () => {
    expect(maskAccountNumber("1028475938")).toBe("•••• 5938");
    expect(maskAccountNumber("0123456789012")).toBe("•••• 9012");
    expect(maskAccountNumber("1234")).toBe("1234");
    expect(maskAccountNumber(null)).toBe("•••• ----");
  });
});
