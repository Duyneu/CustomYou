"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Flame, Check, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HabitItem {
  id: string;
  name: string;
  currentStreak: number;
  isCompletedToday: boolean;
}

export function HabitsCheckinCard({ initialHabits = [] }: { initialHabits?: HabitItem[] }) {
  const [habits, setHabits] = useState<HabitItem[]>(initialHabits);

  const handleToggle = async (habitId: string, currentCompleted: boolean) => {
    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextCompleted = !currentCompleted;
          return {
            ...h,
            isCompletedToday: nextCompleted,
            currentStreak: nextCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
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
          date: new Date().toISOString().split("T")[0],
        }),
      });
    } catch (e) {
      setHabits(initialHabits);
    }
  };

  const safeHabits = Array.isArray(habits) ? habits : [];
  const completedCount = safeHabits.filter((h) => h.isCompletedToday).length;

  return (
    <div className="glass-card p-6 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Thói quen hôm nay</h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              Đã điểm danh {completedCount}/{safeHabits.length} thói quen
            </p>
          </div>
        </div>

        <Link
          href="/tracker"
          className="text-xs text-muted-foreground hover:text-purple-600 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>Chi tiết thói quen</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Habit items */}
      <div className="space-y-2 min-h-[140px]">
        {safeHabits.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Chưa có thói quen nào. Hãy thêm thói quen mới để xây dựng kỷ luật!
          </p>
        ) : (
          safeHabits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-purple-500/[0.05] dark:hover:bg-white/[0.04] transition-colors gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => handleToggle(habit.id, habit.isCompletedToday)}
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    habit.isCompletedToday
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                      : "border border-purple-500/30 dark:border-white/20 hover:border-orange-500"
                  }`}
                  aria-label={habit.isCompletedToday ? "Đã xong" : "Chưa làm"}
                >
                  {habit.isCompletedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <span
                  className={`text-xs truncate ${
                    habit.isCompletedToday
                      ? "text-muted-foreground line-through"
                      : "text-foreground font-medium"
                  }`}
                >
                  {habit.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-orange-500" />
                  {habit.currentStreak}d
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
