"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, Search, LogOut } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timePart = now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentDateTime(`${datePart} · ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-background border-b border-border px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto gap-4">
        {/* Left: Contextual Title & Current Date/Time */}
        <div className="pl-12 lg:pl-0 flex items-center gap-2.5">
          <Link href="/dashboard" className="hidden sm:flex lg:hidden items-center gap-2">
            <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border bg-[#180733]">
              <Image
                src="/logo-mark.png"
                alt="Custom You"
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>
          </Link>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Bảng điều khiển cá nhân
          </span>
          <span className="text-xs text-muted-foreground tabular-nums font-mono hidden md:inline">
            {currentDateTime}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border bg-card text-muted-foreground text-xs hover:border-foreground/30 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm</span>
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Chuyển chế độ sáng và tối"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
