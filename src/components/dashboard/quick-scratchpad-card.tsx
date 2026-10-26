"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StickyNote, ArrowRight, Save, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteSummary {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export function QuickScratchpadCard({ initialNote }: { initialNote?: NoteSummary | null }) {
  const [content, setContent] = useState(initialNote?.content || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      if (initialNote?.id) {
        // Update existing note
        await fetch(`/api/productivity/notes/${initialNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      } else {
        // Create new pinned scratchpad note
        const res = await fetch("/api/productivity/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Ghi chú nhanh Dashboard",
            content,
            isPinned: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          // Updated
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ghi chú nhanh</h2>
            <p className="text-[11px] text-muted-foreground">Ý tưởng & tài liệu lưu tạm</p>
          </div>
        </div>

        <Link
          href="/productivity/notes"
          className="text-xs text-muted-foreground hover:text-purple-600 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>Sổ tay ghi chú</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Textarea Scratchpad */}
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSaved(false);
          }}
          placeholder="Viết nhanh ghi chú, công thức cần nhớ, việc phát sinh trong ngày..."
          className="w-full h-28 p-3 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.04] border border-purple-500/20 dark:border-white/15 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground font-mono">
            {saved ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Đã lưu ghi chú
              </span>
            ) : (
              <span>Chưa lưu thay đổi</span>
            )}
          </span>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <Save className="w-3 h-3" />
            <span>{saving ? "Đang lưu..." : "Lưu ngay"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
