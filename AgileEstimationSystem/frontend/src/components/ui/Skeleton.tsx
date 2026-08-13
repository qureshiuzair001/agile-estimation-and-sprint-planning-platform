import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-ink-900/8 dark:bg-parchment-50/10",
        className
      )}
      {...rest}
    />
  );
}

/** Pre-built skeleton shape for a ticket/session card list. */
export function CardSkeleton() {
  return (
    <div className="rounded-card border border-ink-900/5 bg-white p-5 dark:bg-felt-800 dark:border-parchment-50/10">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}
