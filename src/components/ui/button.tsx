import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white font-medium shadow-[0_4px_16px_rgba(168,85,247,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20 hover:brightness-110 active:scale-[0.985]",
        secondary:
          "bg-white/[0.08] dark:bg-white/[0.07] border border-white/15 text-foreground hover:bg-white/[0.14] active:scale-[0.985]",
        outline:
          "border border-white/15 bg-white/[0.03] text-foreground hover:bg-white/[0.08] hover:border-white/30 active:scale-[0.985] shadow-xs",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-white/[0.06] active:scale-[0.985]",
        destructive:
          "bg-red-600/85 hover:bg-red-500 text-white border border-red-400/30 shadow-[0_4px_16px_rgba(239,68,68,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-[0.985]",
        link:
          "text-purple-400 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-xl",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-10 px-6 text-sm font-semibold rounded-xl",
        icon: "h-8 w-8 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
