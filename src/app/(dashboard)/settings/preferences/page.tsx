"use client";

import React, { useState } from "react";
import { Sliders, Moon, Sun, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/providers/theme-provider";

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [startDay, setStartDay] = useState(1);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Tùy chọn hiển thị & cá nhân hóa
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tùy chỉnh giao diện, chu kỳ tài chính và cài đặt hiển thị của bảng điều khiển.
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* Chủ đề giao diện */}
        <div className="space-y-2 pb-5 border-b border-border/80">
          <label className="text-xs font-semibold text-foreground">Chủ đề giao diện</label>
          <p className="text-xs text-muted-foreground">
            Lựa chọn giao diện sáng (Light) hoặc tối (Dark) theo sở thích thị giác.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                theme === "light"
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-500/40 shadow-xs"
                  : "border-border/80 text-foreground bg-purple-500/[0.04] dark:bg-white/[0.03] hover:bg-purple-500/10 dark:hover:bg-white/[0.08]"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              Giao diện sáng (Light)
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-500/40 shadow-xs"
                  : "border-border/80 text-foreground bg-purple-500/[0.04] dark:bg-white/[0.03] hover:bg-purple-500/10 dark:hover:bg-white/[0.08]"
              }`}
            >
              <Moon className="w-4 h-4 text-purple-400" />
              Giao diện tối (Dark)
            </button>
          </div>
        </div>

        {/* Chu kỳ tài chính */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Ngày bắt đầu tháng tài chính</label>
            <p className="text-xs text-muted-foreground">
              Ngày chu kỳ lương bắt đầu tính ngân sách hàng tháng (mặc định ngày 1 hàng tháng).
            </p>
            <div className="max-w-xs pt-1">
              <Input
                type="number"
                min={1}
                max={28}
                value={startDay}
                onChange={(e) => setStartDay(parseInt(e.target.value, 10))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Đơn vị tiền tệ hiển thị</label>
            <div className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-white/[0.04] border border-purple-500/15 dark:border-white/10 text-xs font-mono text-muted-foreground max-w-xs">
              VND (Việt Nam Đồng - ₫)
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button type="submit" size="sm" className="h-8 text-xs">
              Lưu thay đổi
            </Button>
            {saved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Đã lưu thành công
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
