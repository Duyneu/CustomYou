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
    sm: "text-xs font-normal",
    md: "text-sm font-medium",
    lg: "text-lg font-semibold tracking-tight",
    xl: "text-2xl font-bold tracking-tight",
  };

  const typeClasses = {
    INCOME: "text-emerald-700 dark:text-emerald-400",
    EXPENSE: "text-neutral-900 dark:text-neutral-100",
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
        "inline-flex items-baseline tabular-nums font-mono",
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
