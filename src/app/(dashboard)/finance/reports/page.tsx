"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatVND } from "@/lib/formatters";

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryExpense {
  name: string;
  value: number;
}

const MONOCHROME_COLORS = [
  "#a855f7", // Electric Purple
  "#c084fc", // Light Purple
  "#9333ea", // Deep Violet
  "#d946ef", // Fuchsia
  "#818cf8", // Indigo
  "#f472b6", // Rose Pink
  "#a1a1aa", // Muted Slate
];

export default function ReportsPage() {
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categories, setCategories] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/finance/reports")
      .then((res) => res.json())
      .then((data) => {
        setTrends(data.sixMonthTrends || []);
        setCategories(data.categoryBreakdown || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalExpense6M = trends.reduce((sum, t) => sum + t.expense, 0);
  const totalIncome6M = trends.reduce((sum, t) => sum + t.income, 0);
  const net6M = totalIncome6M - totalExpense6M;
  const hasData = totalIncome6M > 0 || totalExpense6M > 0;
  const maxTrendVal = Math.max(...trends.map((t) => Math.max(t.income, t.expense)), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Báo cáo phân tích tài chính
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Xu hướng dòng tiền 6 tháng gần nhất và cơ cấu phân bổ chi tiêu cá nhân.
        </p>
      </div>

      {/* 3 Thẻ chỉ số tổng kết 6 tháng */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground">Tổng thu nhập 6 tháng</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-foreground mt-1 tabular-nums">
            {formatVND(totalIncome6M.toString())}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground">Tổng chi tiêu 6 tháng</div>
          <div className="text-xl font-semibold font-mono tracking-tight text-foreground mt-1 tabular-nums">
            {formatVND(totalExpense6M.toString())}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground">Dòng tiền thuần tích lũy</div>
          <div className={`text-xl font-semibold font-mono tracking-tight mt-1 tabular-nums ${net6M >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
            {formatVND(net6M.toString())}
          </div>
        </div>
      </div>

      {/* Biểu đồ xu hướng 6 tháng */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Thu chi & dòng tiền theo tháng
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">6 tháng gần nhất</span>
        </div>

        {!hasData && !loading && mounted && (
          <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground">
            Chưa có giao dịch thu chi trong 6 tháng qua. Biểu đồ sẽ tự động thể hiện khi bạn ghi nhận giao dịch mới hoặc nhập sao kê ngân hàng.
          </div>
        )}

        {loading || !mounted ? (
          <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
            Đang tải dữ liệu biểu đồ...
          </div>
        ) : (
          <div className="h-72 w-full pt-4 pointer-events-none select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  tickLine={false}
                  axisLine={false}
                  domain={maxTrendVal === 0 ? [0, 10000000] : [0, "auto"]}
                  ticks={maxTrendVal === 0 ? [0, 2500000, 5000000, 7500000, 10000000] : undefined}
                  tickFormatter={(val) => {
                    if (val === 0) return "0";
                    if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}Tr`;
                    return `${Math.round(val / 1000)}k`;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="income" name="Thu nhập" fill="#a855f7" radius={[3, 3, 0, 0]} activeBar={false} isAnimationActive={false} />
                <Bar dataKey="expense" name="Chi phí" fill="#71717a" radius={[3, 3, 0, 0]} activeBar={false} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Cơ cấu danh mục chi tiêu */}
      <div className="p-5 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Phân bổ chi tiêu tháng này
            </h2>
          </div>
        </div>

        {loading || !mounted ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            Đang tải cơ cấu chi tiêu...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Chưa có giao dịch chi tiêu trong tháng hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-6 h-60 pointer-events-none select-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-6 space-y-2">
              {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: MONOCHROME_COLORS[idx % MONOCHROME_COLORS.length] }}
                    />
                    <span className="text-foreground">{cat.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">{formatVND(cat.value.toString())}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
