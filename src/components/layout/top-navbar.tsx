"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, Search, LogOut, ShieldCheck, User } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { getTimeOfDayGreeting } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "@/lib/motion";

export function TopNavbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("Xin chào!");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setGreeting(getTimeOfDayGreeting(session?.user?.name || "Chủ nhân"));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-20 w-full glass-panel border-b border-white/10 dark:border-white/5 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        {/* Left: Dynamic Greeting & Realtime Clock */}
        <div className="pl-12 lg:pl-0">
          <h1 className="text-base lg:text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {greeting}
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="tabular-nums font-mono">{currentTime}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MyHub Active
            </span>
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-input bg-background/50 hover:bg-accent text-muted-foreground text-xs transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Tìm kiếm...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-semibold text-muted-foreground">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Toggle with Animate UI Spin & Swap */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 relative overflow-hidden"
            title="Đổi giao diện sáng/tối"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Moon className="w-4 h-4 text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* User Session Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <User className="w-4 h-4" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl"
              title="Đăng xuất khỏi MyHub"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
