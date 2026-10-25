/**
 * Định dạng số tiền VND theo quy chuẩn: '1.250.000 ₫'
 * Chấp nhận kiểu bigint, number, hoặc string
 */
export function formatVND(amount: bigint | number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "0 ₫";
  
  let val: bigint;
  if (typeof amount === "bigint") {
    val = amount;
  } else if (typeof amount === "string") {
    try {
      val = BigInt(amount.replace(/[^\d-]/g, "") || "0");
    } catch {
      val = BigInt(0);
    }
  } else {
    val = BigInt(Math.round(amount));
  }

  const isNegative = val < 0n;
  const absVal = isNegative ? -val : val;
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${isNegative ? "-" : ""}${formatted} ₫`;
}

/**
 * Định dạng ngày theo chuẩn Việt Nam (dd/MM/yyyy)
 */
export function formatDateVN(date: Date | string | number | null | undefined): string {
  if (!date) return "--/--/----";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--/--/----";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày giờ đầy đủ (HH:mm dd/MM/yyyy)
 */
export function formatDateTimeVN(date: Date | string | number | null | undefined): string {
  if (!date) return "--:-- --/--/----";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--:-- --/--/----";

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

/**
 * Tạo lời chào theo thời gian trong ngày (Tiếng Việt)
 */
export function getTimeOfDayGreeting(userName?: string | null): string {
  const currentHour = new Date().getHours();
  let timeGreeting = "Xin chào";

  if (currentHour >= 5 && currentHour < 11) {
    timeGreeting = "Chào buổi sáng tốt lành";
  } else if (currentHour >= 11 && currentHour < 14) {
    timeGreeting = "Chào buổi trưa";
  } else if (currentHour >= 14 && currentHour < 18) {
    timeGreeting = "Chào buổi chiều";
  } else {
    timeGreeting = "Chào buổi tối";
  }

  return userName ? `${timeGreeting}, ${userName}!` : `${timeGreeting}!`;
}
