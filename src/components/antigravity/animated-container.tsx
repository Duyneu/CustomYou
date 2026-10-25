"use client";

import React from "react";
import { motion, staggerContainerVariants, staggerItemVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedContainer({
  children,
  className,
  delay = 0,
}: AnimatedContainerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="show"
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={cn("w-full", className)}>
      {children}
    </motion.div>
  );
}
