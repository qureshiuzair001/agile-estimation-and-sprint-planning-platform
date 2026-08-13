import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type BadgeTone = "neutral" | "gold" | "success" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-ink-900/6 text-ink-700 dark:bg-parchment-50/10 dark:text-parchment-100",
  gold: "bg-chip-100 text-chip-700",
  success: "bg-felt-100 text-felt-700",
  danger: "bg-coral-400/15 text-coral-600",
  info: "bg-felt-600/10 text-felt-600 dark:text-felt-300",
};

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
