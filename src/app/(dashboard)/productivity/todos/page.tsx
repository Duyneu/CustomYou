"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckSquare, Circle, CheckCircle2, Trash2, Calendar, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateVN } from "@/lib/formatters";

interface TodoItem {
  id: string;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
  dueDate?: string | null;
  tags: string[];
}

export default function TodosPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "DONE">("ACTIVE");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/productivity/todos");
      const data = await res.json();
      if (res.ok) setTodos(data.todos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch("/api/productivity/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể tạo công việc");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setTitle("");
      setDescription("");
      setTagInput("");
      fetchTodos();
    } catch (err: any) {
      setError(err.message || "Lỗi tạo công việc");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (todo: TodoItem) => {
    const nextStatus = todo.status === "DONE" ? "TODO" : "DONE";
    try {
      const res = await fetch("/api/productivity/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todo.id, status: nextStatus }),
      });
      if (res.ok) fetchTodos();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/productivity/todos?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchTodos();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filterStatus === "ACTIVE") return t.status !== "DONE";
    if (filterStatus === "DONE") return t.status === "DONE";
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Việc cần làm
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý nhiệm vụ cá nhân theo thứ tự ưu tiên, hạn hoàn thành và phân loại thẻ tag.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              onClick={() => setFilterStatus("ACTIVE")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterStatus === "ACTIVE" ? "bg-background text-foreground border border-border/60" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chưa làm
            </button>
            <button
              onClick={() => setFilterStatus("DONE")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterStatus === "DONE" ? "bg-background text-foreground border border-border/60" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đã xong
            </button>
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterStatus === "ALL" ? "bg-background text-foreground border border-border/60" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
          </div>

          <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            Thêm việc
          </Button>
        </div>
      </div>

      {/* Danh sách nhiệm vụ */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Đang tải danh sách công việc...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Không có công việc nào cần giải quyết trong mục này.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTodos.map((todo) => {
              const isDone = todo.status === "DONE";
              return (
                <div
                  key={todo.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleStatus(todo)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className={`text-xs font-medium text-foreground truncate ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {todo.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        {todo.dueDate && (
                          <span className="font-mono">Hạn: {formatDateVN(todo.dueDate)}</span>
                        )}
                        {todo.tags.map((tag, idx) => (
                          <span key={idx} className="font-mono">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {todo.priority === "HIGH" && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-1 font-normal">
                        Ưu tiên cao
                      </Badge>
                    )}
                    {todo.priority === "URGENT" && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-1 font-normal">
                        Khẩn cấp
                      </Badge>
                    )}

                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
              <h2 className="text-base font-semibold text-foreground">Thêm việc cần làm</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTodo} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tiêu đề công việc</label>
                <Input
                  required
                  placeholder="VD: Nộp báo cáo tài chính, Thanh toán tiền điện..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Mức độ ưu tiên</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Bình thường</option>
                    <option value="HIGH">Ưu tiên cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Hạn hoàn thành</label>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Thẻ tag (cách nhau bởi dấu phẩy)</label>
                <Input
                  placeholder="work, finance, urgent..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
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
