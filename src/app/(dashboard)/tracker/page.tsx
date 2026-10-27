"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Flame,
  Plus,
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Check,
  Trash2,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/formatters";

interface Transaction {
  id: string;
  amount: string;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  description: string | null;
  date: string;
  category: { id: string; name: string; color: string | null } | null;
  account: { id: string; name: string } | null;
}

interface Habit {
  id: string;
  name: string;
  currentStreak: number;
  longestStreak: number;
  frequency: string;
  logs: { date: string; completed: boolean }[];
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string | null;
}

interface Account {
  id: string;
  name: string;
}

const PIE_COLORS = [
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#f43f5e",
];

export default function CombinedTrackerPage() {
  const [activeTab, setActiveTab] = useState<"finance" | "habits">("finance");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Form thêm giao dịch nhanh
  const [txForm, setTxForm] = useState({
    amount: "",
    type: "EXPENSE",
    categoryId: "",
    accountId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Form thêm thói quen mới
  const [newHabitName, setNewHabitName] = useState("");
  const [habitSubmitting, setHabitSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resHabit, resCat, resAcc] = await Promise.all([
        fetch("/api/finance/transactions"),
        fetch("/api/productivity/habits"),
        fetch("/api/finance/categories"),
        fetch("/api/finance/accounts"),
      ]);

      if (resTx.ok) {
        const data = await resTx.json();
        setTransactions(Array.isArray(data.transactions) ? data.transactions : Array.isArray(data) ? data : []);
      }
      if (resHabit.ok) {
        const hData = await resHabit.json();
        setHabits(Array.isArray(hData.habits) ? hData.habits : Array.isArray(hData) ? hData : []);
      }
      if (resCat.ok) {
        const catData = await resCat.json();
        const catList = Array.isArray(catData.categories) ? catData.categories : Array.isArray(catData) ? catData : [];
        setCategories(catList);
        if (catList.length > 0 && !txForm.categoryId) {
          const expenseCat = catList.find((c: any) => c.type === "EXPENSE");
          if (expenseCat) setTxForm((prev) => ({ ...prev, categoryId: expenseCat.id }));
        }
      }
      if (resAcc.ok) {
        const accData = await resAcc.json();
        const accList = Array.isArray(accData.accounts) ? accData.accounts : Array.isArray(accData) ? accData : [];
        setAccounts(accList);
        if (accList.length > 0 && !txForm.accountId) {
          setTxForm((prev) => ({ ...prev, accountId: accList[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Thêm giao dịch
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.accountId) return;

    setTxSubmitting(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: txForm.amount,
          type: txForm.type,
          categoryId: txForm.categoryId || undefined,
          accountId: txForm.accountId,
          description: txForm.description || undefined,
          date: txForm.date,
        }),
      });

      if (res.ok) {
        setTxForm((prev) => ({
          ...prev,
          amount: "",
          description: "",
        }));
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTxSubmitting(false);
    }
  };

  // Thêm thói quen
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setHabitSubmitting(true);
    try {
      const res = await fetch("/api/productivity/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHabitName.trim(),
          frequency: "DAILY",
        }),
      });

      if (res.ok) {
        setNewHabitName("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHabitSubmitting(false);
    }
  };

  // Toggle thói quen
  const handleToggleHabit = async (habitId: string, currentCompleted: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextState = !currentCompleted;
          return {
            ...h,
            currentStreak: nextState ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            logs: [{ date: today, completed: nextState }],
          };
        }
        return h;
      })
    );

    try {
      await fetch(`/api/productivity/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !currentCompleted,
          date: today,
        }),
      });
    } catch (e) {
      fetchData();
    }
  };

  // Xóa giao dịch
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  // 1. Chuẩn bị dữ liệu cho Biểu đồ phân bổ chi tiêu (Donut Chart)
  const expenseByCategory: { [name: string]: number } = {};
  safeTransactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const name = t.category?.name || "Chi khác";
      const val = Number(t.amount);
      expenseByCategory[name] = (expenseByCategory[name] || 0) + val;
    });

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Chuẩn bị dữ liệu cho Biểu đồ xu hướng thu chi 7 ngày qua (Bar Chart)
  const last7DaysMap: { [dateStr: string]: { date: string; expense: number; income: number } } = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    const displayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    last7DaysMap[key] = { date: displayLabel, expense: 0, income: 0 };
  }

  safeTransactions.forEach((t) => {
    const dayKey = t.date?.split("T")[0];
    if (dayKey && last7DaysMap[dayKey]) {
      if (t.type === "EXPENSE") last7DaysMap[dayKey].expense += Number(t.amount);
      if (t.type === "INCOME") last7DaysMap[dayKey].income += Number(t.amount);
    }
  });

  const barData = Object.values(last7DaysMap);

  // Tổng quan chi tiêu tháng
  const totalExpense = safeTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = safeTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Theo dõi Chi tiêu & Thói quen</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Nhập liệu tức thì · Phân tích trực quan qua biểu đồ dòng tiền & kỷ luật cá nhân.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70">
          <button
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === "finance"
                ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Thu chi & Biểu đồ</span>
          </button>
          <button
            onClick={() => setActiveTab("habits")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === "habits"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Kỷ luật Thói quen</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: THU CHI & BIỂU ĐỒ ===================== */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Tổng chi gần đây</span>
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatVND(totalExpense.toString())}
              </div>
            </div>
            <div className="glass-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Tổng thu gần đây</span>
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatVND(totalIncome.toString())}
              </div>
            </div>
            <div className="glass-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Chênh lệch tích lũy</span>
              <div
                className={`text-2xl font-mono font-bold ${
                  totalIncome - totalExpense >= 0
                    ? "text-purple-600 dark:text-purple-300"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatVND((totalIncome - totalExpense).toString())}
              </div>
            </div>
          </div>

          {/* Form Nhập Dữ Liệu Nhanh */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Nhập nhanh khoản thu / chi mới</span>
              </h2>
              <span className="text-[11px] text-muted-foreground font-mono">Ghi chép giao dịch</span>
            </div>

            <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Loại giao dịch</label>
                <select
                  value={txForm.type}
                  onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                  className="w-full h-9 text-xs px-2.5 rounded-xl border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-foreground"
                >
                  <option value="EXPENSE" className="bg-card">Khoản Chi</option>
                  <option value="INCOME" className="bg-card">Khoản Thu</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Số tiền (VNĐ)</label>
                <Input
                  required
                  type="number"
                  placeholder="VD: 50000"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Danh mục</label>
                <select
                  value={txForm.categoryId}
                  onChange={(e) => setTxForm({ ...txForm, categoryId: e.target.value })}
                  className="w-full h-9 text-xs px-2.5 rounded-xl border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-foreground"
                >
                  {safeCategories
                    .filter((c) => c.type === txForm.type)
                    .map((c) => (
                      <option key={c.id} value={c.id} className="bg-card">
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Nội dung ghi chú</label>
                <Input
                  placeholder="VD: Cơm trưa, giáo trình..."
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={txSubmitting || !txForm.amount}
                  className="w-full h-9 text-xs gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{txSubmitting ? "Lưu..." : "Ghi nhận"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Hai Biểu Đồ Trực Quan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Biểu đồ Donut: Cơ cấu chi tiêu */}
            <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Cơ cấu danh mục chi tiêu</span>
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground">Phân bổ %</span>
              </div>

              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                  Chưa có giao dịch chi tiêu để vẽ biểu đồ.
                </div>
              ) : (
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="rgba(255,255,255,0.2)"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatVND(val.toString()), "Chi tiêu"]}
                        contentStyle={{
                          backgroundColor: "rgba(18, 8, 36, 0.92)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70 text-xs">
                {pieData.slice(0, 4).map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Biểu đồ Cột: Xu hướng 7 ngày qua */}
            <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Dòng tiền 7 ngày gần nhất</span>
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Chi tiêu</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Thu nhập</span>
                  </span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.1)" />
                    <XAxis dataKey="date" stroke="#a296bd" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#a296bd"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatVND(val.toString())]}
                      contentStyle={{
                        backgroundColor: "rgba(18, 8, 36, 0.92)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="expense" name="Chi tiêu" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-xs text-muted-foreground pt-1 text-center">
                Dữ liệu biến động thu và chi được cập nhật tự động theo thời gian thực.
              </p>
            </div>
          </div>

          {/* Lịch sử giao dịch gần đây */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border/70 flex items-center justify-between bg-purple-500/[0.04] dark:bg-white/[0.03]">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Giao dịch ghi nhận gần nhất
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {safeTransactions.length} bản ghi
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {safeTransactions.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="px-5 py-3 flex items-center justify-between text-xs hover:bg-purple-500/[0.05] dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {t.description || t.category?.name || "Giao dịch"}
                      </span>
                      {t.category && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {t.category.name}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(t.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono font-semibold ${
                        t.type === "EXPENSE"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {t.type === "EXPENSE" ? "-" : "+"}
                      {formatVND(t.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: KỶ LUẬT THÓI QUEN ===================== */}
      {activeTab === "habits" && (
        <div className="space-y-6">
          {/* Form thêm thói quen mới */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-500" />
              <span>Khởi tạo thói quen kỷ luật mới</span>
            </h2>

            <form onSubmit={handleAddHabit} className="flex gap-3">
              <Input
                required
                placeholder="VD: Đọc sách 20 phút, Tập thể dục, Học tiếng Anh..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="h-10 text-xs flex-1"
              />
              <Button
                type="submit"
                disabled={habitSubmitting || !newHabitName.trim()}
                className="h-10 text-xs gap-1.5 shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                <Plus className="w-4 h-4" />
                <span>{habitSubmitting ? "Đang lưu..." : "Thêm thói quen"}</span>
              </Button>
            </form>
          </div>

          {/* Danh sách thói quen & Điểm danh tuần */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeHabits.map((habit) => {
              const isDoneToday =
                habit.logs?.some((l) => l.date === todayStr && l.completed);

              return (
                <div
                  key={habit.id}
                  className="glass-card p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-foreground">{habit.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span>Kỷ lục: {habit.longestStreak} ngày</span>
                        <span>•</span>
                        <span>Tần suất: Hàng ngày</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Flame className="w-4 h-4 fill-orange-500" />
                        {habit.currentStreak} ngày
                      </span>
                    </div>
                  </div>

                  {/* Nút điểm danh lớn */}
                  <div className="pt-2 border-t border-border/70 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Trạng thái hôm nay:
                    </span>
                    <button
                      onClick={() => handleToggleHabit(habit.id, isDoneToday)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isDoneToday
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isDoneToday ? "text-emerald-500" : ""}`} />
                      <span>{isDoneToday ? "Đã hoàn thành" : "Điểm danh ngay"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
