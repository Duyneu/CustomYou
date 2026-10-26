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
  Building2,
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
      title: "Tài chính",
      items: [
        { title: "Ví và tài khoản", href: "/finance/accounts", icon: Wallet },
        { title: "Giao dịch", href: "/finance/transactions", icon: Receipt },
        { title: "Ngân sách tháng", href: "/finance/budgets", icon: PieChart },
        { title: "Báo cáo dòng tiền", href: "/finance/reports", icon: CreditCard },
        { title: "Mục tiêu tích lũy", href: "/finance/goals", icon: Target },
        { title: "Sổ nợ và vay", href: "/finance/debts", icon: Scale },
        { title: "Nhập sao kê CSV", href: "/finance/import", icon: FileSpreadsheet },
        { title: "Kết nối ngân hàng", href: "/finance/bank-connect", icon: Building2, badge: "Adapter" },
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
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/80 flex-shrink-0 bg-[#180733]">
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
            <span className="font-bold text-sm tracking-tight text-foreground leading-tight">
              CUSTOM YOU
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              Bảng điều khiển cá nhân
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          aria-label="Đóng menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === "/dashboard"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tổng quan</span>
          </Link>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1 text-xs text-muted-foreground font-medium">
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
                      "flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[10px] border",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                          : "bg-secondary text-muted-foreground border-border"
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

      {/* Footer System Status */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="text-foreground font-medium">
            Tài khoản độc lập
          </div>
          <div>Mã hóa AES-256-GCM</div>
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
          className="p-2 rounded-lg bg-card border border-border text-foreground"
          aria-label="Mở danh mục điều hướng"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
        />
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-screen fixed top-0 left-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-xl transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
