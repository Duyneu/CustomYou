export interface RuleMatchInput {
  description?: string | null;
  amount?: bigint | number | null;
  bankCode?: string | null;
}

export interface RuleDefinition {
  id: string;
  name: string;
  matchField: "DESCRIPTION" | "AMOUNT" | "BANK_CODE";
  operator: "CONTAINS" | "STARTS_WITH" | "REGEX" | "EQUALS";
  pattern: string;
  targetCategoryId: string;
  priority: number;
  isActive: boolean;
}

/**
 * Khớp giao dịch với danh sách quy tắc người dùng (đã sắp xếp theo priority giảm dần)
 * Trả về targetCategoryId đầu tiên phù hợp, hoặc null nếu không khớp.
 */
export function matchAutoCategory(
  input: RuleMatchInput,
  rules: RuleDefinition[]
): string | null {
  const activeRules = rules
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of activeRules) {
    let sourceText = "";

    if (rule.matchField === "DESCRIPTION") {
      sourceText = (input.description || "").trim().toLowerCase();
    } else if (rule.matchField === "BANK_CODE") {
      sourceText = (input.bankCode || "").trim().toLowerCase();
    } else if (rule.matchField === "AMOUNT") {
      sourceText = input.amount !== null && input.amount !== undefined ? input.amount.toString() : "";
    }

    const pattern = rule.pattern.trim().toLowerCase();

    let isMatch = false;

    switch (rule.operator) {
      case "CONTAINS":
        isMatch = sourceText.includes(pattern);
        break;

      case "STARTS_WITH":
        isMatch = sourceText.startsWith(pattern);
        break;

      case "EQUALS":
        isMatch = sourceText === pattern;
        break;

      case "REGEX":
        try {
          const regex = new RegExp(rule.pattern, "i");
          isMatch = regex.test(input.description || "");
        } catch (e) {
          isMatch = false;
        }
        break;

      default:
        isMatch = false;
    }

    if (isMatch) {
      return rule.targetCategoryId;
    }
  }

  return null;
}
