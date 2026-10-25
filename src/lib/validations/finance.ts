import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Tên tài khoản không được để trống").max(50),
  type: z.enum(["BANK", "CASH", "E_WALLET", "CREDIT_CARD", "INVESTMENT"]),
  bankCode: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  initialBalance: z.coerce.number().int().default(0),
  currency: z.string().default("VND"),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isExcludedFromTotal: z.boolean().default(false),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional().nullable(),
  isExcludedFromTotal: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Tài khoản không hợp lệ"),
  targetAccountId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().int().positive("Số tiền phải lớn hơn 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  note: z.string().max(255).optional().nullable(),
  isExcludedFromBudget: z.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export const createRuleSchema = z.object({
  name: z.string().min(1, "Tên quy tắc không được để trống"),
  matchField: z.enum(["DESCRIPTION", "AMOUNT", "BANK_CODE"]).default("DESCRIPTION"),
  operator: z.enum(["CONTAINS", "STARTS_WITH", "REGEX", "EQUALS"]).default("CONTAINS"),
  pattern: z.string().min(1, "Từ khóa không được để trống"),
  targetCategoryId: z.string().uuid("Danh mục áp dụng không hợp lệ"),
  priority: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const upsertBudgetSchema = z.object({
  categoryId: z.string().uuid("Danh mục không hợp lệ"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2050),
  limitAmount: z.coerce.number().int().positive("Hạn mức phải lớn hơn 0"),
});
