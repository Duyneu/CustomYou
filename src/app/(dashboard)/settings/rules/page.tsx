"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Trash2, CheckCircle2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface RuleItem {
  id: string;
  name: string;
  matchField: "DESCRIPTION" | "AMOUNT" | "BANK_CODE";
  operator: "CONTAINS" | "STARTS_WITH" | "REGEX" | "EQUALS";
  pattern: string;
  priority: number;
  isActive: boolean;
  targetCategory: {
    id: string;
    name: string;
    type: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

export default function RulesPage() {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("");
  const [operator, setOperator] = useState<"CONTAINS" | "STARTS_WITH" | "REGEX">("CONTAINS");
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [priority, setPriority] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRulesAndCategories = async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        fetch("/api/settings/rules"),
        fetch("/api/finance/categories"),
      ]);

      const rData = await rRes.json();
      const cData = await cRes.json();

      if (rRes.ok) {
        setRules(rData.rules || []);
      }
      if (cRes.ok) {
        setCategories(cData.categories || []);
        if (!targetCategoryId && cData.categories?.length > 0) {
          setTargetCategoryId(cData.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndCategories();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/settings/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          pattern: pattern.trim(),
          operator,
          matchField: "DESCRIPTION",
          targetCategoryId,
          priority: Number(priority),
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo quy tắc");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setName("");
      setPattern("");
      fetchRulesAndCategories();
    } catch (err) {
      setError("Lỗi kết nối khi tạo quy tắc");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRule = async (rule: RuleItem) => {
    try {
      const res = await fetch(`/api/settings/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      if (res.ok) {
        fetchRulesAndCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quy tắc phân loại này?")) return;

    try {
      const res = await fetch(`/api/settings/rules/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRulesAndCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Quy tắc phân loại tự động
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tự động gán danh mục khi ghi nhận giao dịch hoặc nhận webhook ngân hàng dựa trên từ khóa.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm quy tắc
        </Button>
      </div>

      {/* Rules List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground grid grid-cols-12 gap-2">
          <span className="col-span-3">Tên quy tắc</span>
          <span className="col-span-4">Điều kiện so khớp</span>
          <span className="col-span-3">Danh mục áp dụng</span>
          <span className="col-span-2 text-right">Trạng thái</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải quy tắc...</div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa có quy tắc nào. Nhấn "Thêm quy tắc" để tự động hóa phân loại chi tiêu.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-muted/30 transition-colors text-xs"
              >
                <div className="col-span-3 font-medium text-foreground">
                  {rule.name}
                </div>

                <div className="col-span-4 text-muted-foreground font-mono">
                  {rule.operator === "CONTAINS" && `Chứa "${rule.pattern}"`}
                  {rule.operator === "STARTS_WITH" && `Bắt đầu bằng "${rule.pattern}"`}
                  {rule.operator === "REGEX" && `Biểu thức: /${rule.pattern}/`}
                </div>

                <div className="col-span-3">
                  <Badge variant="outline" className="text-xs font-normal">
                    {rule.targetCategory.name}
                  </Badge>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="text-xs text-muted-foreground hover:text-foreground font-mono"
                  >
                    {rule.isActive ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Đang bật</span>
                    ) : (
                      <span className="text-muted-foreground">Tắt</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm quy tắc */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Tạo quy tắc phân loại</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên quy tắc</label>
                <Input
                  required
                  placeholder="VD: Grab Xe ôm, Shopee Đơn hàng..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Kiểu so khớp</label>
                  <select
                    value={operator}
                    onChange={(e: any) => setOperator(e.target.value)}
                    className="w-full h-9 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="CONTAINS">Chứa từ khóa</option>
                    <option value="STARTS_WITH">Bắt đầu bằng</option>
                    <option value="REGEX">Regular Expression</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Từ khóa nhận diện</label>
                  <Input
                    required
                    placeholder="VD: GRAB, SHOPEE..."
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tự động gán vào danh mục</label>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  className="w-full h-9 text-xs px-2.5 rounded-md border border-input bg-background text-foreground"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type === "EXPENSE" ? "Chi" : "Thu"})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Độ ưu tiên (Số càng cao càng ưu tiên)</label>
                <Input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value || "0", 10))}
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
                  {submitting ? "Đang lưu..." : "Xác nhận tạo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
