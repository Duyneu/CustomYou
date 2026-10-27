"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Check, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TodoItem {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate?: string | null;
}

export function TodayTodosCard({ initialTodos = [] }: { initialTodos?: TodoItem[] }) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus as any } : t))
    );

    try {
      await fetch(`/api/productivity/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      // Revert on error
      setTodos(initialTodos);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/productivity/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: "HIGH",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTodos((prev) => [created, ...prev]);
        setNewTitle("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const safeTodos = Array.isArray(todos) ? todos : [];
  const completedCount = safeTodos.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="glass-card p-6 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Việc cần làm hôm nay</h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              Đã xong {completedCount}/{safeTodos.length} nhiệm vụ
            </p>
          </div>
        </div>

        <Link
          href="/productivity/todos"
          className="text-xs text-muted-foreground hover:text-purple-600 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>Mở sổ việc</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Add Inline Input */}
      <form onSubmit={handleCreate} className="relative flex items-center">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Thêm nhanh việc cần làm... (nhấn Enter)"
          disabled={loading}
          className="w-full h-9 px-3 pr-8 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.04] border border-purple-500/20 dark:border-white/15 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || loading}
          className="absolute right-2 p-1 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-40 transition-colors cursor-pointer"
          aria-label="Thêm việc"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Todos List */}
      <div className="space-y-2 min-h-[140px]">
        {safeTodos.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Tuyệt vời! Không còn việc tồn đọng hôm nay.
          </p>
        ) : (
          safeTodos.slice(0, 5).map((todo) => {
            const isDone = todo.status === "COMPLETED";

            return (
              <div
                key={todo.id}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-purple-500/[0.05] dark:hover:bg-white/[0.04] transition-colors gap-2 group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggle(todo.id, todo.status)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : "border border-purple-500/40 dark:border-white/30 hover:border-purple-500"
                    }`}
                    aria-label={isDone ? "Đánh dấu chưa xong" : "Đánh dấu hoàn thành"}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    className={`text-xs truncate transition-all ${
                      isDone
                        ? "line-through text-muted-foreground/60"
                        : "text-foreground font-medium"
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>

                {todo.priority === "HIGH" && (
                  <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0">
                    Quan trọng
                  </Badge>
                )}
                {todo.priority === "URGENT" && (
                  <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0 animate-pulse">
                    Khẩn cấp
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
