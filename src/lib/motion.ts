"use client";

import { motion, AnimatePresence, type Transition } from "motion/react";

/**
 * Animate UI tokens (Springs & Transitions)
 * Tuân thủ quy tắc chuyển động của Animate UI:
 * - Mọi chuyển động dựa trên Spring vật lý hoặc Tween cong mềm mại
 * - Phản hồi nhấn (press) nhanh và đàn hồi (stiffness 550, damping 30)
 * - Xuất hiện nhẹ nhàng từ dưới lên và phóng nhẹ (staggered entrance)
 */
export const spring = {
  press: { type: "spring", stiffness: 550, damping: 30, restSpeed: 10 } as Transition,
  pop: { type: "spring", stiffness: 400, damping: 29 } as Transition,
  dialog: { type: "spring", stiffness: 150, damping: 25 } as Transition,
  entrance: { type: "spring", stiffness: 220, damping: 22 } as Transition,
  selection: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  bouncy: { type: "spring", stiffness: 260, damping: 18 } as Transition,
};

export const ease = {
  soft: [0.16, 1, 0.3, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

export const transition = {
  menu: { duration: 0.22, ease: ease.soft } as Transition,
  swap: { duration: 0.15, ease: ease.out } as Transition,
  spin: { duration: 0.3, ease: ease.soft } as Transition,
  overlay: { duration: 0.4, ease: ease.soft } as Transition,
};

// Container chứa các thẻ với hiệu ứng xuất hiện so le (Staggered Children)
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Phần tử con xuất hiện theo dạng lướt nhẹ từ dưới lên và xóa mờ
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.entrance,
  },
};

export { motion, AnimatePresence };
