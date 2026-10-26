"use client";

import React, { useState, useEffect } from "react";
import { Plus, Flame, Check, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HabitItem {
  id: string;
  name: string;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  logs: { completed: boolean; date: string }[];
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/productivity/habits");
      const data = await res.json();
      if (res.ok) setHabits(data.habits || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCheckin = async (habitId: string) => {
    try {
      const res = await fetch("/api/productivity/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin", habitId }),
      });
      if (res.ok) fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/productivity/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo thói quen");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setName("");
      fetchHabits();
    } catch (err: any) {
      setError(err.message || "Lỗi tạo thói quen");
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
            Thói quen hàng ngày & chuỗi kiên trì
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xây dựng nếp sống kỷ luật mỗi ngày với điểm chuỗi liên tục (Streak).
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Thêm thói quen
        </Button>
      </div>

      {/* Danh sách thói quen */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground flex justify-between items-center">
          <span>Tên thói quen</span>
          <span>Chuỗi kiên trì & Điểm danh</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải thói quen...</div>
        ) : habits.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa có thói quen nào. Hãy thêm một thói quen tích cực (Đọc sách 20 phút, Tập gym...).
          </div>
        ) : (
          <div className="divide-y divide-border">
            {habits.map((habit) => {
              const isDoneToday = habit.logs.length > 0 && habit.logs[0].completed;
              return (
                <div
                  key={habit.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-foreground">{habit.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        Chuỗi hiện tại: {habit.currentStreak} ngày
                      </span>
                      <span>Kỷ lục: {habit.longestStreak} ngày</span>
                    </div>
                  </div>

                  <div>
                    <Button
                      size="sm"
                      variant={isDoneToday ? "outline" : "default"}
                      onClick={() => handleCheckin(habit.id)}
                      className="h-8 text-xs gap-1.5"
                    >
                      {isDoneToday ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Đã điểm danh</span>
                        </>
                      ) : (
                        <span>Hoàn thành hôm nay</span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Thêm thói quen mới</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên thói quen</label>
                <Input
                  required
                  placeholder="VD: Đọc 20 trang sách, Uống 2L nước..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
