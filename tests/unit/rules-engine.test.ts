import { describe, it, expect } from "vitest";
import { matchAutoCategory, RuleDefinition } from "@/lib/services/rules-engine";

describe("Auto Classification Rules Engine", () => {
  const mockRules: RuleDefinition[] = [
    {
      id: "rule-1",
      name: "Grab Transport",
      matchField: "DESCRIPTION",
      operator: "CONTAINS",
      pattern: "GRAB",
      targetCategoryId: "cat-transport",
      priority: 10,
      isActive: true,
    },
    {
      id: "rule-2",
      name: "Highlands Coffee",
      matchField: "DESCRIPTION",
      operator: "CONTAINS",
      pattern: "HIGHLANDS",
      targetCategoryId: "cat-dining",
      priority: 5,
      isActive: true,
    },
    {
      id: "rule-3",
      name: "Shopee Starts With",
      matchField: "DESCRIPTION",
      operator: "STARTS_WITH",
      pattern: "SHOPEEPAY",
      targetCategoryId: "cat-shopping",
      priority: 8,
      isActive: true,
    },
    {
      id: "rule-4",
      name: "Inactive Rule",
      matchField: "DESCRIPTION",
      operator: "CONTAINS",
      pattern: "TIKI",
      targetCategoryId: "cat-shopping",
      priority: 100,
      isActive: false,
    },
    {
      id: "rule-5",
      name: "Regex salary",
      matchField: "DESCRIPTION",
      operator: "REGEX",
      pattern: "LUONG.*T10",
      targetCategoryId: "cat-income",
      priority: 20,
      isActive: true,
    },
  ];

  it("should match CONTAINS rule ignoring case", () => {
    const category = matchAutoCategory({ description: "Thanh toan GrabCar 123" }, mockRules);
    expect(category).toBe("cat-transport");
  });

  it("should match higher priority rule first", () => {
    const category = matchAutoCategory({ description: "LUONG THANG T10 CONG TY" }, mockRules);
    expect(category).toBe("cat-income");
  });

  it("should ignore inactive rules", () => {
    const category = matchAutoCategory({ description: "TIKI ORDER 999" }, mockRules);
    expect(category).toBeNull();
  });

  it("should match STARTS_WITH operator", () => {
    const match = matchAutoCategory({ description: "ShopeePay chuyen tien" }, mockRules);
    expect(match).toBe("cat-shopping");

    const noMatch = matchAutoCategory({ description: "Giao dich qua ShopeePay" }, mockRules);
    expect(noMatch).toBeNull();
  });

  it("should return null when no rules match", () => {
    const category = matchAutoCategory({ description: "Mua rau ngoai cho" }, mockRules);
    expect(category).toBeNull();
  });
});
