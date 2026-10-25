import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Lấy khóa chủ 32-byte (256 bits) từ biến môi trường
 */
function getMasterKey(): Buffer {
  const masterKeyHex = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKeyHex) {
    throw new Error("ENCRYPTION_MASTER_KEY chưa được thiết lập trong biến môi trường.");
  }
  
  const key = Buffer.from(masterKeyHex, "hex");
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_MASTER_KEY không hợp lệ: Cần 32 bytes (64 hex characters), nhận được ${key.length} bytes.`
    );
  }
  return key;
}

export interface EncryptedPayload {
  iv: string;
  tag: string;
  ciphertext: string;
}

/**
 * Mã hóa chuỗi văn bản bằng AES-256-GCM
 * Trả về chuỗi định dạng: "ivHex:tagHex:cipherHex"
 */
export function encrypt(text: string): string {
  if (!text) return "";
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Giải mã chuỗi đã mã hóa định dạng "ivHex:tagHex:cipherHex"
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Dữ liệu mã hóa không đúng định dạng 'iv:tag:ciphertext'");
  }

  const [ivHex, tagHex, cipherHex] = parts;
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const ciphertext = Buffer.from(cipherHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Che dấu số tài khoản chỉ để lộ 4 số cuối
 * Ví dụ: "1028475938" -> "•••• 5938"
 */
export function maskAccountNumber(accountNumber?: string | null): string {
  if (!accountNumber) return "•••• ----";
  const cleaned = accountNumber.replace(/\s+/g, "");
  if (cleaned.length <= 4) {
    return cleaned;
  }
  const lastFour = cleaned.slice(-4);
  return `•••• ${lastFour}`;
}
