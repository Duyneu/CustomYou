import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedContainer({
  children,
  className,
}: AnimatedContainerProps) {
  return <div className={cn("w-full space-y-8", className)}>{children}</div>;
}

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}
