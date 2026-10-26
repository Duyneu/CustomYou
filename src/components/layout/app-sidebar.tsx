"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PieChart,
  Target,
  FileSpreadsheet,
  GraduationCap,
  BarChart3,
  CheckSquare,
  Flame,
  FileText,
  Sliders,
  Scale,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  CreditCard,
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

  const sections: NavSection[] = [
    {
      title: "Học tập",
      items: [
        { title: "Nhật ký & Môn học", href: "/study", icon: GraduationCap, badge: "Mới" },
      ],
    },
    {
      title: "Tài chính & Theo dõi",
      items: [
        { title: "Theo dõi & Biểu đồ", href: "/tracker", icon: BarChart3, badge: "Hub" },
        { title: "Ví và tài khoản", href: "/finance/accounts", icon: Wallet },
        { title: "Giao dịch", href: "/finance/transactions", icon: Receipt },
        { title: "Ngân sách tháng", href: "/finance/budgets", icon: PieChart },
        { title: "Báo cáo dòng tiền", href: "/finance/reports", icon: CreditCard },
        { title: "Mục tiêu tích lũy", href: "/finance/goals", icon: Target },
        { title: "Sổ nợ và vay", href: "/finance/debts", icon: Scale },
        { title: "Nhập sao kê CSV", href: "/finance/import", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Năng suất",
      items: [
        { title: "Việc cần làm", href: "/productivity/todos", icon: CheckSquare },
        { title: "Thói quen hàng ngày", href: "/productivity/habits", icon: Flame },
        { title: "Sổ tay ghi chú", href: "/productivity/notes", icon: FileText },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        { title: "Tùy chọn hiển thị", href: "/settings/preferences", icon: Sliders },
        { title: "Quy tắc phân loại", href: "/settings/rules", icon: Sparkles },
        { title: "Bảo mật tài khoản", href: "/settings/security", icon: ShieldCheck },
        { title: "Quyền riêng tư dữ liệu", href: "/settings/privacy", icon: UserCheck },
      ],
    },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full glass-chrome border-r border-border/80">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/70">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-purple-500/20 dark:border-white/25 bg-purple-900/10 dark:bg-[#180733] flex-shrink-0 shadow-[0_4px_16px_rgba(168,85,247,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo-mark.png"
              alt="Custom You"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground leading-tight drop-shadow-sm">
              CUSTOM YOU
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-300/80 leading-tight font-medium">
              Personal Platform
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg border border-border/60 bg-purple-500/10 dark:bg-white/[0.04] hover:bg-purple-500/20 dark:hover:bg-white/[0.1] text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Đóng menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        <div>
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150",
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-medium shadow-[0_4px_16px_rgba(168,85,247,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20"
                : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/[0.05] hover:border-purple-500/20 dark:hover:border-white/10 border border-transparent"
            )}
          >
            <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Tổng quan</span>
          </Link>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1 text-[11px] text-muted-foreground/75 font-semibold uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all duration-150",
                      isActive
                        ? "bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 text-white font-medium shadow-[0_4px_16px_rgba(168,85,247,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/[0.05] hover:border-purple-500/20 dark:hover:border-white/10 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-purple-600 dark:text-purple-400/80")} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[10px] font-mono border",
                        isActive
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-purple-500/10 dark:bg-white/[0.06] text-purple-700 dark:text-purple-300 border-purple-500/20 dark:border-white/15"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status with Tactile Frosted Pill */}
      <div className="p-3 border-t border-border/70">
        <div className="p-2.5 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-purple-500/15 dark:border-white/10 text-xs text-muted-foreground space-y-1">
          <div className="text-foreground font-medium flex items-center justify-between">
            <span>Tài khoản độc lập</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-[11px] text-muted-foreground/80 font-mono">
            Mã hóa AES-256-GCM
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl glass-chrome border border-white/15 text-foreground shadow-md active:scale-95 transition-all"
          aria-label="Mở danh mục điều hướng"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen fixed top-0 left-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transition-transform duration-250 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
