"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Sparkles } from "lucide-react";

export function LiveClockCard({ userName = "Hữu Duy" }: { userName?: string }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="glass-card p-6 h-full flex flex-col justify-between animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-10 w-48 bg-white/10 rounded my-4" />
        <div className="h-4 w-40 bg-white/10 rounded" />
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const formattedHours = String(hours).padStart(2, "0");

  let greeting = "Chào buổi sáng";
  let greetingSub = "Khởi đầu ngày mới tràn đầy năng lượng & tập trung!";
  if (hours >= 11 && hours < 14) {
    greeting = "Chào buổi trưa";
    greetingSub = "Dành thời gian nghỉ ngơi nạp lại năng lượng nhé.";
  } else if (hours >= 14 && hours < 18) {
    greeting = "Chào buổi chiều";
    greetingSub = "Tiếp tục hoàn thành các mục tiêu học tập hôm nay.";
  } else if (hours >= 18) {
    greeting = "Chào buổi tối";
    greetingSub = "Ôn lại kiến thức trong ngày và thư giãn.";
  }

  const dateStr = time.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="glass-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
      {/* Ambient background glow inside card */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-purple-500/15 blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all duration-500"
        aria-hidden="true"
      />

      <div className="space-y-1 z-10">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-medium text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {greeting}, {userName}!
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{greetingSub}</p>
      </div>

      <div className="my-4 z-10">
        <div className="flex items-baseline gap-1 font-mono tracking-tight font-bold text-foreground">
          <span className="text-4xl sm:text-5xl tabular-nums">{formattedHours}</span>
          <span className="text-3xl sm:text-4xl text-purple-500 animate-pulse">:</span>
          <span className="text-4xl sm:text-5xl tabular-nums">{minutes}</span>
          <span className="text-2xl sm:text-3xl text-purple-400 font-normal ml-1 tabular-nums">
            :{seconds}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground z-10">
        <div className="flex items-center gap-1.5 capitalize">
          <Calendar className="w-3.5 h-3.5 text-purple-500" />
          <span>{dateStr}</span>
        </div>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
          GMT+7 (Hà Nội)
        </span>
      </div>
    </div>
  );
}
