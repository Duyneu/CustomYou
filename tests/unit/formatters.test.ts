import { describe, it, expect } from "vitest";
import { formatVND, formatDateVN, formatDateTimeVN, getTimeOfDayGreeting } from "../../src/lib/formatters";

describe("Formatters Module", () => {
  describe("formatVND", () => {
    it("định dạng chuẩn số tiền VND với dấu chấm phân tách hàng nghìn", () => {
      expect(formatVND(1250000)).toBe("1.250.000 ₫");
      expect(formatVND(45000000n)).toBe("45.000.000 ₫");
      expect(formatVND(0)).toBe("0 ₫");
      expect(formatVND(500)).toBe("500 ₫");
    });

    it("định dạng chính xác số tiền âm", () => {
      expect(formatVND(-350000)).toBe("-350.000 ₫");
      expect(formatVND(-1500000n)).toBe("-1.500.000 ₫");
    });

    it("xử lý an toàn giá trị chuỗi hoặc null", () => {
      expect(formatVND("2000000")).toBe("2.000.000 ₫");
      expect(formatVND(null)).toBe("0 ₫");
      expect(formatVND(undefined)).toBe("0 ₫");
    });
  });

  describe("formatDateVN", () => {
    it("định dạng ngày tháng dd/MM/yyyy", () => {
      const date = new Date(2026, 9, 25); // Tháng 10 (0-indexed 9)
      expect(formatDateVN(date)).toBe("25/10/2026");
    });
  });

  describe("getTimeOfDayGreeting", () => {
    it("sinh lời chào phù hợp", () => {
      const greeting = getTimeOfDayGreeting("Chủ nhân");
      expect(greeting).toContain("Chủ nhân");
    });
  });
});
