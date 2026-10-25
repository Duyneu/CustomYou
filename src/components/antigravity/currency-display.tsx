"use client";

import React from "react";
import { formatVND } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: bigint | number | string | null | undefined;
  type?: "INCOME" | "EXPENSE" | "NEUTRAL";
  size?: "sm" | "md" | "lg" | "xl";
  showPrefix?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  type = "NEUTRAL",
  size = "md",
  showPrefix = false,
  className,
}: CurrencyDisplayProps) {
  const formatted = formatVND(amount);
  const isZero = formatted === "0 ₫";

  const sizeClasses = {
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-xl font-bold tracking-tight",
    xl: "text-3xl font-extrabold tracking-tight",
  };

  const typeClasses = {
    INCOME: "text-emerald-600 dark:text-emerald-400",
    EXPENSE: "text-rose-600 dark:text-rose-400",
    NEUTRAL: "text-foreground",
  };

  let prefix = "";
  if (showPrefix && !isZero) {
    if (type === "INCOME") prefix = "+";
    if (type === "EXPENSE") prefix = "-";
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-nums",
        sizeClasses[size],
        typeClasses[type],
        className
      )}
    >
      {prefix}
      {formatted}
    </span>
  );
}
