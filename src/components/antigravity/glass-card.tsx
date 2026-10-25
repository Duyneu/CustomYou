import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  enableTilt?: boolean; // giữ prop để tương thích giao diện nhưng dùng CSS tĩnh
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glow = false, enableTilt, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-200",
          glow && "hover:border-emerald-500/40 hover:shadow-antigravity-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
