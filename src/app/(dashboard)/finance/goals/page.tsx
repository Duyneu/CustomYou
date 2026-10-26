"use client";

import React, { useState, useEffect } from "react";
import { Plus, Target, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/formatters";

interface GoalItem {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate?: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "PAUSED";
}

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/finance/goals");
      const data = await res.json();
      if (res.ok) setGoals(data.goals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const rawTarget = parseInt(targetAmount.replace(/\D/g, "") || "0", 10);
      const rawCurrent = parseInt(currentAmount.replace(/\D/g, "") || "0", 10);

      const res = await fetch("/api/finance/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetAmount: rawTarget,
          currentAmount: rawCurrent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo mục tiêu");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      fetchGoals();
    } catch (err: any) {
      setError(err.message || "Lỗi tạo mục tiêu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Mục tiêu tiết kiệm & tích lũy
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi tiến độ tích lũy quỹ dự phòng, mua sắm hoặc du lịch cá nhân.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm mục tiêu
        </Button>
      </div>

      {/* Danh sách mục tiêu */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải mục tiêu...</div>
        ) : goals.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa có mục tiêu tích lũy nào. Nhấn "Thêm mục tiêu" để bắt đầu theo dõi.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {goals.map((goal) => {
              const percent = Math.min(
                100,
                Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100)
              );
              return (
                <div key={goal.id} className="p-5 space-y-2.5 hover:bg-purple-500/[0.05] dark:hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{goal.name}</span>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5">
                        {formatVND(goal.currentAmount)} / {formatVND(goal.targetAmount)} ({percent}%)
                      </div>
                    </div>

                    <Badge variant={percent >= 100 ? "success" : "outline"} className="text-xs font-mono">
                      {percent >= 100 ? "Đã hoàn thành" : "Đang thực hiện"}
                    </Badge>
                  </div>

                  <div className="w-full h-2 rounded-full bg-purple-500/10 dark:bg-white/[0.08] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="glass-overlay rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <h2 className="text-base font-semibold text-foreground">Thêm mục tiêu mới</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-purple-500/10 dark:hover:bg-white/[0.08] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên mục tiêu</label>
                <Input
                  required
                  placeholder="VD: Quỹ khẩn cấp 6 tháng, Đổi laptop..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Số tiền mục tiêu (VND)</label>
                <Input
                  required
                  placeholder="0"
                  className="font-mono text-base font-semibold"
                  value={targetAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setTargetAmount(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "");
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Số tiền hiện có (VND)</label>
                <Input
                  placeholder="0"
                  className="font-mono"
                  value={currentAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setCurrentAmount(raw ? new Intl.NumberFormat("vi-VN").format(parseInt(raw, 10)) : "0");
                  }}
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
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
