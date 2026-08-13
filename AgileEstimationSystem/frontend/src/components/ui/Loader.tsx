import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loader({ label = "Loading…", fullScreen = false, className }: LoaderProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-ink-600 dark:text-parchment-200/70",
        fullScreen && "fixed inset-0 z-40 bg-parchment-50 dark:bg-felt-900",
        !fullScreen && "py-10",
        className
      )}
    >
      <Loader2 className="size-6 animate-spin text-chip-400" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
