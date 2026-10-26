import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-normal transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-purple-400/30 bg-purple-500/20 text-purple-200 shadow-sm",
        secondary:
          "border-white/15 bg-white/[0.08] text-foreground",
        destructive:
          "border-red-400/30 bg-red-500/20 text-red-300 shadow-sm",
        outline:
          "border-white/20 bg-transparent text-muted-foreground",
        success:
          "border-emerald-400/30 bg-emerald-500/20 text-emerald-300 shadow-sm",
        warning:
          "border-amber-400/30 bg-amber-500/20 text-amber-300 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
