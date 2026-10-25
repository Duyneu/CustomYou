"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PieChart,
  Target,
  FileSpreadsheet,
  Building2,
  CheckSquare,
  Flame,
  FileText,
  Settings,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Sliders,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(true);
  const [productivityOpen, setProductivityOpen] = useState(true);

  const sections: NavSection[] = [
    {
      title: "TÀI CHÍNH THÔNG MINH",
      items: [
        { title: "Ví & Tài khoản", href: "/finance/accounts", icon: Wallet },
        { title: "Giao dịch", href: "/finance/transactions", icon: Receipt },
        { title: "Ngân sách tháng", href: "/finance/budgets", icon: PieChart },
        { title: "Báo cáo & Dòng tiền", href: "/finance/reports", icon: CreditCard },
        { title: "Mục tiêu tiết kiệm", href: "/finance/goals", icon: Target },
        { title: "Khoản nợ & Vay", href: "/finance/debts", icon: Scale },
        { title: "Import sao kê CSV", href: "/finance/import", icon: FileSpreadsheet },
        { title: "Kết nối Ngân hàng", href: "/finance/bank-connect", icon: Building2, badge: "Adapter" },
      ],
    },
    {
      title: "NĂNG SUẤT CÁ NHÂN",
      items: [
        { title: "Việc cần làm", href: "/productivity/todos", icon: CheckSquare },
        { title: "Thói quen & Streak", href: "/productivity/habits", icon: Flame },
        { title: "Sổ tay ghi chú", href: "/productivity/notes", icon: FileText },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { title: "Cá nhân hóa", href: "/settings/preferences", icon: Sliders },
        { title: "Luật phân loại", href: "/settings/rules", icon: Sparkles },
        { title: "Bảo mật & 2FA", href: "/settings/security", icon: ShieldCheck },
        { title: "Dữ liệu & NĐ 13", href: "/settings/privacy", icon: UserCheck },
      ],
    },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Logo & Name */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/10 dark:border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              MyHub
            </div>
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase font-medium">
              Không gian cá nhân
            </div>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Dashboard Direct Link */}
        <div>
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all",
              pathname === "/dashboard"
                ? "bg-emerald-500 text-zinc-950 font-semibold shadow-md shadow-emerald-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Bảng điều khiển</span>
          </Link>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group",
                      isActive
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-500" : "group-hover:text-foreground")} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/10 dark:border-white/5">
        <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/50 border border-white/10 text-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground font-medium">
            <span>Chế độ:</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Độc lập (Single-user)
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground/70">
            Dữ liệu mã hóa AES-256-GCM
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl glass-panel shadow-md text-foreground"
          aria-label="Mở Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 z-30 glass-panel border-r border-white/10 dark:border-white/5 shadow-antigravity-sm">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 glass-panel shadow-2xl transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
