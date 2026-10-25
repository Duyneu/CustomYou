"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Receipt, Wallet, CheckSquare, FileText, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GlobalSearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigationItems = [
    { title: "Ví và tài khoản", href: "/finance/accounts", icon: Wallet, category: "Tài chính" },
    { title: "Lịch sử giao dịch", href: "/finance/transactions", icon: Receipt, category: "Tài chính" },
    { title: "Ngân sách tháng", href: "/finance/budgets", icon: Receipt, category: "Tài chính" },
    { title: "Báo cáo phân tích", href: "/finance/reports", icon: Receipt, category: "Tài chính" },
    { title: "Mục tiêu tích lũy", href: "/finance/goals", icon: Receipt, category: "Tài chính" },
    { title: "Sổ ghi nợ & vay", href: "/finance/debts", icon: Receipt, category: "Tài chính" },
    { title: "Nhập sao kê CSV", href: "/finance/import", icon: Receipt, category: "Tài chính" },
    { title: "Kết nối ngân hàng & QR", href: "/finance/bank-connect", icon: Receipt, category: "Tài chính" },
    { title: "Việc cần làm", href: "/productivity/todos", icon: CheckSquare, category: "Năng suất" },
    { title: "Thói quen hàng ngày", href: "/productivity/habits", icon: CheckSquare, category: "Năng suất" },
    { title: "Sổ tay ghi chú", href: "/productivity/notes", icon: FileText, category: "Năng suất" },
    { title: "Quy tắc phân loại tự động", href: "/settings/rules", icon: Receipt, category: "Cài đặt" },
    { title: "Quyền riêng tư & Xuất dữ liệu", href: "/settings/privacy", icon: Receipt, category: "Cài đặt" },
    { title: "Bảo mật tài khoản & 2FA", href: "/settings/security", icon: Receipt, category: "Cài đặt" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const filtered = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Tìm kiếm chức năng, giao dịch, ghi chú... (Esc để đóng)"
            className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Không tìm thấy kết quả nào phù hợp với "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="p-2.5 rounded-lg flex items-center justify-between hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">{item.title}</div>
                      <div className="text-[10px] text-muted-foreground">{item.category}</div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Dùng phím ↑ ↓ để di chuyển, Enter để mở</span>
          <span className="font-mono">MyHub Global Search</span>
        </div>
      </div>
    </div>
  );
}
