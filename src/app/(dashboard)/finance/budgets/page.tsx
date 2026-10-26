"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, AlertOctagon, CheckCircle2, Sliders, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/formatters";

interface BudgetItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string | null;
  month: number;
  year: number;
  limitAmount: string;
  spentAmount: string;
  remainingAmount: string;
  percentage: number;
  isWarning: boolean;
  isExceeded: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`/api/finance/budgets?month=${month}&year=${year}`),
        fetch("/api/finance/categories"),
      ]);

      const bData = await bRes.json();
      const cData = await cRes.json();

      if (bRes.ok) {
        setBudgets(bData.budgets || []);
      }
      if (cRes.ok) {
        const expenseCategories = (cData.categories || []).filter(
          (c: any) => c.type === "EXPENSE"
        );
        setCategories(expenseCategories);
        if (!selectedCatId && expenseCategories.length > 0) {
          setSelectedCatId(expenseCategories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const rawLimit = parseInt(limitInput.replace(/\D/g, "") || "0", 10);
      if (rawLimit <= 0) {
        setError("Vui lòng nhập hạn mức lớn hơn 0");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId,
          month,
          year,
          limitAmount: rawLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể lưu ngân sách");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setLimitInput("");
      fetchBudgets();
    } catch (err) {
      setError("Đã xảy ra lỗi khi lưu");
    } finally {
      setSubmitting(false);
    }
  };

  const totalLimit = budgets.reduce((sum, b) => sum + BigInt(b.limitAmount), 0n);
  const totalSpent = budgets.reduce((sum, b) => sum + BigInt(b.spentAmount), 0n);
  const overallPercent = totalLimit > 0n ? Math.round((Number(totalSpent) / Number(totalLimit)) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Ngân sách chi tiêu tháng {month}/{year}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kiểm soát hạn mức theo từng danh mục. Cảnh báo tự động tại ngưỡng 80% và 100%.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="h-8 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>

          <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            Đặt ngân sách
          </Button>
        </div>
      </div>

      {/* Tóm tắt tổng thể */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground font-medium">Tổng chi tiêu so với hạn mức</div>
            <div className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-foreground mt-0.5 tabular-nums drop-shadow-xs">
              {formatVND(totalSpent.toString())} <span className="text-sm font-normal text-muted-foreground">/ {formatVND(totalLimit.toString())}</span>
            </div>
          </div>
          <div className="font-mono text-sm font-semibold text-foreground px-2.5 py-1 rounded-lg bg-purple-500/10 dark:bg-white/[0.06] border border-purple-500/20 dark:border-white/10">
            {overallPercent}% đã dùng
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-purple-500/10 dark:bg-white/[0.08] border border-purple-500/15 dark:border-white/10 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercent >= 100
                ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : overallPercent >= 80
                ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* Danh sách ngân sách theo danh mục */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/80 text-xs font-semibold text-muted-foreground flex justify-between items-center bg-purple-500/[0.04] dark:bg-white/[0.03]">
          <span>Danh mục chi tiêu</span>
          <span>Thực tế / Hạn mức</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải danh sách ngân sách...</div>
        ) : budgets.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa có ngân sách nào được thiết lập cho tháng {month}/{year}. Nhấn "Đặt ngân sách" để bắt đầu.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {budgets.map((b) => (
              <div key={b.id} className="p-4 space-y-2 hover:bg-purple-500/[0.05] dark:hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{b.categoryName}</span>
                    {b.isExceeded && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-1.5 flex items-center gap-1 font-normal">
                        <AlertOctagon className="w-3 h-3" />
                        Vượt hạn mức
                      </Badge>
                    )}
                    {b.isWarning && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1 font-normal">
                        <AlertTriangle className="w-3 h-3" />
                        Đạt {b.percentage}%
                      </Badge>
                    )}
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="font-semibold text-foreground">{formatVND(b.spentAmount)}</span>
                    <span className="text-muted-foreground"> / {formatVND(b.limitAmount)}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-purple-500/10 dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      b.isExceeded
                        ? "bg-red-500"
                        : b.isWarning
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-purple-600 to-fuchsia-600"
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Đặt ngân sách */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="glass-overlay rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <h2 className="text-base font-semibold text-foreground">
                Thiết lập hạn mức ngân sách
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-purple-500/10 dark:hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Danh mục áp dụng</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full h-9 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Hạn mức chi tiêu tháng (VND)</label>
                <Input
                  required
                  placeholder="0"
                  className="font-mono text-base font-semibold"
                  value={limitInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setLimitInput(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "");
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Đang lưu..." : "Lưu hạn mức"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
