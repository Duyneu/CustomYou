import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  enableTilt?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, glow, enableTilt, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "minimal-surface p-6 rounded-xl border border-border bg-card text-card-foreground",
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
