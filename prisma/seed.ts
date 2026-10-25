import { PrismaClient, TransactionType, AccountType, TodoPriority, HabitFrequency, WidgetType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu khởi tạo dữ liệu mẫu cho MyHub...");

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@myhub.local";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "MyHub@2026!";

  // 1. Tạo hoặc cập nhật tài khoản người dùng duy nhất
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: "Chủ Nhân MyHub",
      passwordHash,
      twoFactorEnabled: false,
    },
  });

  console.log(`👤 Người dùng quản trị: ${user.email} (ID: ${user.id})`);

  // 2. Cài đặt người dùng (UserSettings)
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fiscalMonthStartDay: 1,
      currency: "VND",
      locale: "vi",
      theme: "dark",
      accentColor: "emerald",
      budgetAlertThreshold: 80,
    },
  });

  // 3. Khởi tạo danh mục thu/chi mặc định
  const defaultCategories = [
    // Chi tiêu (EXPENSE)
    { name: "Ăn uống", type: TransactionType.EXPENSE, icon: "Utensils", color: "#f97316" },
    { name: "Di chuyển", type: TransactionType.EXPENSE, icon: "Car", color: "#06b6d4" },
    { name: "Nhà cửa & Tiện ích", type: TransactionType.EXPENSE, icon: "Home", color: "#8b5cf6" },
    { name: "Mua sắm", type: TransactionType.EXPENSE, icon: "ShoppingBag", color: "#ec4899" },
    { name: "Giải trí", type: TransactionType.EXPENSE, icon: "Film", color: "#eab308" },
    { name: "Y tế & Sức khỏe", type: TransactionType.EXPENSE, icon: "HeartPulse", color: "#ef4444" },
    { name: "Giáo dục & Phát triển", type: TransactionType.EXPENSE, icon: "GraduationCap", color: "#3b82f6" },
    
    // Thu nhập (INCOME)
    { name: "Lương tháng", type: TransactionType.INCOME, icon: "Briefcase", color: "#10b981" },
    { name: "Thưởng dự án", type: TransactionType.INCOME, icon: "Award", color: "#14b8a6" },
    { name: "Lợi nhuận đầu tư", type: TransactionType.INCOME, icon: "TrendingUp", color: "#22c55e" },
    { name: "Thu nhập phụ", type: TransactionType.INCOME, icon: "Coins", color: "#84cc16" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of defaultCategories) {
    const createdCat = await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: cat.name,
          type: cat.type,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    });
    categoryMap.set(cat.name, createdCat.id);
  }
  console.log(`📁 Đã tạo ${categoryMap.size} danh mục chuẩn.`);

  // 4. Khởi tạo các tài khoản / ví mẫu
  const accountsData = [
    {
      name: "Vietcombank Chính",
      type: AccountType.BANK,
      bankCode: "VCB",
      accountNumberMasked: "•••• 6868",
      balance: 45000000n, // 45.000.000 ₫
      initialBalance: 45000000n,
      color: "#006633",
      icon: "Building2",
    },
    {
      name: "Ví MoMo",
      type: AccountType.E_WALLET,
      bankCode: "MOMO",
      accountNumberMasked: "•••• 9988",
      balance: 3250000n, // 3.250.000 ₫
      initialBalance: 3250000n,
      color: "#a50064",
      icon: "Smartphone",
    },
    {
      name: "Ví tiền mặt",
      type: AccountType.CASH,
      balance: 1500000n, // 1.500.000 ₫
      initialBalance: 1500000n,
      color: "#f59e0b",
      icon: "Wallet",
    },
  ];

  const accountMap = new Map<string, string>();
  for (const acc of accountsData) {
    const existing = await prisma.account.findFirst({
      where: { userId: user.id, name: acc.name },
    });
    if (!existing) {
      const created = await prisma.account.create({
        data: {
          userId: user.id,
          name: acc.name,
          type: acc.type,
          bankCode: acc.bankCode,
          accountNumberMasked: acc.accountNumberMasked,
          balance: acc.balance,
          initialBalance: acc.initialBalance,
          color: acc.color,
          icon: acc.icon,
        },
      });
      accountMap.set(acc.name, created.id);
    } else {
      accountMap.set(acc.name, existing.id);
    }
  }
  console.log(`💳 Đã tạo các ví/tài khoản mặc định.`);

  // 5. Khởi tạo quy tắc phân loại tự động
  const foodCatId = categoryMap.get("Ăn uống");
  const transportCatId = categoryMap.get("Di chuyển");
  const shoppingCatId = categoryMap.get("Mua sắm");
  const salaryCatId = categoryMap.get("Lương tháng");

  if (transportCatId) {
    await prisma.autoClassificationRule.createMany({
      data: [
        { userId: user.id, name: "Grab Taxi / Food", pattern: "GRAB", targetCategoryId: transportCatId, priority: 10 },
        { userId: user.id, name: "Be Group", pattern: "BE GROUP", targetCategoryId: transportCatId, priority: 9 },
      ],
      skipDuplicates: true,
    });
  }

  if (shoppingCatId) {
    await prisma.autoClassificationRule.createMany({
      data: [
        { userId: user.id, name: "Shopee Pay", pattern: "SHOPEE", targetCategoryId: shoppingCatId, priority: 8 },
        { userId: user.id, name: "Tiki Trading", pattern: "TIKI", targetCategoryId: shoppingCatId, priority: 7 },
      ],
      skipDuplicates: true,
    });
  }

  if (foodCatId) {
    await prisma.autoClassificationRule.createMany({
      data: [
        { userId: user.id, name: "Highlands Coffee", pattern: "HIGHLANDS", targetCategoryId: foodCatId, priority: 6 },
        { userId: user.id, name: "Phúc Long Tea", pattern: "PHUC LONG", targetCategoryId: foodCatId, priority: 5 },
      ],
      skipDuplicates: true,
    });
  }

  if (salaryCatId) {
    await prisma.autoClassificationRule.createMany({
      data: [
        { userId: user.id, name: "Tiền lương công ty", pattern: "LUONG", targetCategoryId: salaryCatId, priority: 15 },
      ],
      skipDuplicates: true,
    });
  }
  console.log(`⚙️ Đã thiết lập các quy tắc tự động phân loại.`);

  // 6. Khởi tạo ngân sách tháng hiện tại
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (foodCatId) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId: foodCatId,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        userId: user.id,
        categoryId: foodCatId,
        month: currentMonth,
        year: currentYear,
        limitAmount: 6000000n, // Hạn mức 6.000.000 ₫
      },
    });
  }

  if (transportCatId) {
    await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId: transportCatId,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        userId: user.id,
        categoryId: transportCatId,
        month: currentMonth,
        year: currentYear,
        limitAmount: 2000000n, // Hạn mức 2.000.000 ₫
      },
    });
  }

  // 7. Khởi tạo mục tiêu tiết kiệm
  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: user.id,
        name: "Quỹ dự phòng khẩn cấp 6 tháng",
        targetAmount: 120000000n, // 120.000.000 ₫
        currentAmount: 45000000n,  // 45.000.000 ₫ (37.5%)
        color: "#10b981",
        icon: "ShieldCheck",
      },
      {
        userId: user.id,
        name: "Nâng cấp Macbook Pro M-Series",
        targetAmount: 55000000n,  // 55.000.000 ₫
        currentAmount: 22000000n,  // 22.000.000 ₫ (40%)
        color: "#6366f1",
        icon: "Laptop",
      },
    ],
    skipDuplicates: true,
  });

  // 8. Khởi tạo việc cần làm (Todo)
  await prisma.todo.createMany({
    data: [
      {
        userId: user.id,
        title: "Đối soát sao kê ngân hàng tuần 4",
        description: "Kiểm tra lại các khoản chi tiêu qua thẻ Vietcombank",
        priority: TodoPriority.HIGH,
        tags: ["Tài chính", "MyHub"],
        dueDate: new Date(Date.now() + 86400000 * 2),
      },
      {
        userId: user.id,
        title: "Thiết lập cấu hình Webhook SePay",
        description: "Đăng ký webhook để đồng bộ giao dịch ngân hàng tự động",
        priority: TodoPriority.MEDIUM,
        tags: ["Cài đặt", "Tự động hóa"],
        dueDate: new Date(Date.now() + 86400000 * 3),
      },
      {
        userId: user.id,
        title: "Đọc 30 trang sách Clean Architecture",
        priority: TodoPriority.LOW,
        tags: ["Phát triển"],
      },
    ],
    skipDuplicates: true,
  });

  // 9. Khởi tạo thói quen (Habits)
  const habit1 = await prisma.habit.create({
    data: {
      userId: user.id,
      name: "Chạy bộ 30 phút mỗi sáng",
      frequency: HabitFrequency.DAILY,
      currentStreak: 12,
      longestStreak: 25,
      color: "#10b981",
      icon: "Activity",
    },
  });

  const habit2 = await prisma.habit.create({
    data: {
      userId: user.id,
      name: "Ghi chép chi tiêu trong ngày",
      frequency: HabitFrequency.DAILY,
      currentStreak: 7,
      longestStreak: 14,
      color: "#3b82f6",
      icon: "Receipt",
    },
  });

  // Ghi nhật ký thói quen hôm nay
  const todayStr = new Date().toISOString().split("T")[0];
  await prisma.habitLog.createMany({
    data: [
      { habitId: habit1.id, date: todayStr, completed: true },
      { habitId: habit2.id, date: todayStr, completed: true },
    ],
    skipDuplicates: true,
  });

  // 10. Khởi tạo ghi chú cá nhân (Markdown Note)
  await prisma.note.create({
    data: {
      userId: user.id,
      title: "Kế hoạch tài chính & Mục tiêu cá nhân 2026",
      content: `## Kế hoạch tài chính cá nhân 2026\n\n- **Quy tắc 50/30/20**:\n  - 50% Nhu cầu thiết yếu (Nhà, ăn uống, di chuyển)\n  - 30% Sở thích cá nhân & Mua sắm\n  - 20% Tiết kiệm & Tích lũy đầu tư dài hạn\n\n- **Nguyên tắc dòng tiền**:\n  - Luôn kiểm tra số dư và ngân sách qua **MyHub** hàng ngày.\n  - Giữ tỷ lệ nợ / thu nhập dưới 15%.\n\n> "Đừng tiết kiệm những gì còn lại sau khi chi tiêu, hãy chi tiêu những gì còn lại sau khi tiết kiệm."`,
      isPinned: true,
      tags: ["Tài chính", "Kế hoạch 2026"],
      color: "#10b981",
    },
  });

  // 11. Khởi tạo bố cục Dashboard mặc định (Dashboard Widgets)
  const defaultWidgets = [
    { type: WidgetType.TOTAL_BALANCE, colSpan: 2, rowSpan: 1, orderIndex: 0, customTitle: "Tổng tài sản & Ví" },
    { type: WidgetType.MONTHLY_EXPENSE, colSpan: 1, rowSpan: 1, orderIndex: 1, customTitle: "Chi tiêu tháng này" },
    { type: WidgetType.BUDGET_OVERVIEW, colSpan: 1, rowSpan: 1, orderIndex: 2, customTitle: "Ngân sách danh mục" },
    { type: WidgetType.TODAY_TASKS, colSpan: 1, rowSpan: 1, orderIndex: 3, customTitle: "Việc hôm nay" },
    { type: WidgetType.HABIT_TRACKER, colSpan: 1, rowSpan: 1, orderIndex: 4, customTitle: "Chuỗi thói quen (Streak)" },
    { type: WidgetType.SAVINGS_PROGRESS, colSpan: 1, rowSpan: 1, orderIndex: 5, customTitle: "Mục tiêu tích lũy" },
    { type: WidgetType.RECENT_TRANSACTIONS, colSpan: 2, rowSpan: 1, orderIndex: 6, customTitle: "Giao dịch gần đây" },
  ];

  for (const w of defaultWidgets) {
    await prisma.dashboardWidget.create({
      data: {
        userId: user.id,
        type: w.type,
        colSpan: w.colSpan,
        rowSpan: w.rowSpan,
        orderIndex: w.orderIndex,
        customTitle: w.customTitle,
        isVisible: true,
      },
    });
  }

  console.log("✅ Hoàn tất khởi tạo dữ liệu mẫu thành công!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
