"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, MapPin, Clock, ArrowRight, User, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseItem {
  id: string;
  name: string;
  code: string | null;
  instructor: string | null;
  room: string | null;
  dayOfWeek: number; // 2..8
  startTime: string;
  endTime: string;
  color: string | null;
  completedLessons: number;
  totalLessons: number;
}

const DAYS = [
  { val: 2, label: "T2" },
  { val: 3, label: "T3" },
  { val: 4, label: "T4" },
  { val: 5, label: "T5" },
  { val: 6, label: "T6" },
  { val: 7, label: "T7" },
  { val: 8, label: "CN" },
];

export function TodayScheduleCard({ initialCourses = [] }: { initialCourses?: CourseItem[] }) {
  // Xác định thứ hôm nay: JavaScript getDay(): 0 = CN (val 8), 1 = T2 (val 2), ...
  const getTodayDayVal = () => {
    const d = new Date().getDay();
    return d === 0 ? 8 : d + 1;
  };

  const [selectedDay, setSelectedDay] = useState(getTodayDayVal());
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/study/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (e) {
        // bỏ qua
      }
    }
    if (initialCourses.length === 0) {
      load();
    }
  }, [initialCourses]);

  const coursesOnDay = courses.filter((c) => c.dayOfWeek === selectedDay);

  return (
    <div className="glass-card p-6 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Thời khóa biểu & Lịch học</h2>
            <p className="text-[11px] text-muted-foreground">Lịch các môn trong tuần</p>
          </div>
        </div>

        <Link
          href="/study"
          className="text-xs text-muted-foreground hover:text-purple-600 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>Nhật ký học tập</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center justify-between gap-1 p-1 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70">
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.val;
          const isToday = getTodayDayVal() === d.val;
          const hasClasses = courses.some((c) => c.dayOfWeek === d.val);

          return (
            <button
              key={d.val}
              onClick={() => setSelectedDay(d.val)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-purple-500/10 dark:hover:bg-white/[0.05]"
              }`}
            >
              <span>{d.label}</span>
              {hasClasses && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
              )}
              {isToday && !isSelected && (
                <span className="absolute -top-1 right-1 text-[9px] text-purple-600 dark:text-purple-400 font-bold">
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Courses List for Selected Day */}
      <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
        {coursesOnDay.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border/70 space-y-2">
            <p className="text-xs text-muted-foreground">
              {selectedDay === getTodayDayVal()
                ? "Hôm nay bạn không có lịch học trên trường! Thời gian tuyệt vời để tự học hoặc nghỉ ngơi."
                : "Không có lịch học vào ngày này."}
            </p>
            <Link
              href="/study"
              className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm môn học mới</span>
            </Link>
          </div>
        ) : (
          coursesOnDay.map((course) => {
            const progress = Math.min(
              100,
              Math.round((course.completedLessons / (course.totalLessons || 15)) * 100)
            );

            return (
              <div
                key={course.id}
                className="p-3.5 rounded-xl bg-purple-500/[0.03] dark:bg-white/[0.02] border border-border/70 hover:border-purple-500/30 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {course.name}
                      </span>
                      {course.code && (
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                          {course.code}
                        </Badge>
                      )}
                    </div>
                    {course.instructor && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-purple-400" />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                    {course.room && (
                      <div className="text-[11px] text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{course.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>
                      Tiến độ: {course.completedLessons}/{course.totalLessons || 15} buổi
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-purple-500/10 dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
