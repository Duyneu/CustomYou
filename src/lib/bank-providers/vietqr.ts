export interface VietQrParams {
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  amount?: number | bigint;
  description?: string;
  template?: "compact" | "compact2" | "qr_only" | "print";
}

/**
 * Tạo URL mã QR chuyển khoản VietQR chuẩn Napas 247
 */
export function generateVietQrUrl(params: VietQrParams): string {
  const {
    bankCode,
    accountNumber,
    accountName,
    amount,
    description,
    template = "compact2",
  } = params;

  const cleanBank = encodeURIComponent(bankCode.trim());
  const cleanAcc = encodeURIComponent(accountNumber.trim().replace(/\s+/g, ""));
  let url = `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-${template}.png`;

  const queryParts: string[] = [];
  if (amount && Number(amount) > 0) {
    queryParts.push(`amount=${amount.toString()}`);
  }
  if (description) {
    queryParts.push(`addInfo=${encodeURIComponent(description)}`);
  }
  if (accountName) {
    queryParts.push(`accountName=${encodeURIComponent(accountName)}`);
  }

  if (queryParts.length > 0) {
    url += `?${queryParts.join("&")}`;
  }

  return url;
}
