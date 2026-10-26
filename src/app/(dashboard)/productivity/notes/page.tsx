"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pin, Trash2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateVN } from "@/lib/formatters";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/productivity/notes");
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes || []);
        if (data.notes?.length > 0 && !activeNote) {
          setActiveNote(data.notes[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async () => {
    try {
      const res = await fetch("/api/productivity/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Ghi chú mới",
          content: "# Tiêu đề\n\nNội dung ghi chú bằng markdown...",
          isPinned: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchNotes();
        setActiveNote(data.note);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveActiveNote = async () => {
    if (!activeNote) return;
    setSubmitting(true);
    try {
      await fetch("/api/productivity/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeNote.id,
          title: activeNote.title,
          content: activeNote.content,
          isPinned: activeNote.isPinned,
        }),
      });
      fetchNotes();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) return;
    try {
      await fetch(`/api/productivity/notes?id=${id}`, { method: "DELETE" });
      setActiveNote(null);
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Sổ tay ghi chú cá nhân (Markdown)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Không gian lưu trữ ý tưởng, kế hoạch và tài liệu cá nhân hỗ trợ định dạng Markdown.
          </p>
        </div>

        <Button onClick={handleCreateNote} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Tạo ghi chú mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
        {/* Cột danh sách ghi chú */}
        <div className="md:col-span-4 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground">
            Danh sách ({notes.length})
          </div>

          <div className="divide-y divide-border overflow-y-auto flex-1">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Đang tải...</div>
            ) : notes.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Chưa có ghi chú nào.</div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    activeNote?.id === note.id ? "bg-muted" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {note.title}
                    </span>
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-muted-foreground shrink-0 rotate-45" />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-1">
                    {note.content.replace(/[#*`]/g, "").slice(0, 50)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột trình soạn thảo ghi chú */}
        <div className="md:col-span-8 rounded-xl border border-border bg-card p-5 flex flex-col space-y-4">
          {activeNote ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                  className="text-base font-semibold bg-transparent border-none outline-none text-foreground w-full"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveNote({ ...activeNote, isPinned: !activeNote.isPinned })}
                    className={`p-1.5 rounded transition-colors ${
                      activeNote.isPinned ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Ghim ghi chú"
                  >
                    <Pin className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(activeNote.id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-red-600 transition-colors"
                    title="Xóa ghi chú"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Button
                    size="sm"
                    onClick={handleSaveActiveNote}
                    disabled={submitting}
                    className="h-7 text-xs"
                  >
                    {submitting ? "Đang lưu..." : "Lưu"}
                  </Button>
                </div>
              </div>

              <textarea
                value={activeNote.content}
                onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                placeholder="Nhập nội dung markdown..."
                className="w-full flex-1 min-h-[350px] bg-transparent border-none outline-none font-mono text-xs text-foreground resize-none leading-relaxed"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              Chọn hoặc tạo một ghi chú ở danh sách bên trái để chỉnh sửa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
