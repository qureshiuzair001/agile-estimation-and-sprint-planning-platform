import { cn } from "@/utils/cn";

export interface AvatarProps {
  username: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
} as const;

/** Deterministically picks one of a fixed palette based on the username, so the same person always gets the same color. */
function colorForUsername(username: string): string {
  const palette = [
    "bg-felt-500",
    "bg-chip-400",
    "bg-coral-500",
    "bg-felt-400",
    "bg-chip-600",
  ];

  const hash = Array.from(username).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return palette[hash % palette.length];
}

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ username, isOnline, size = "md", className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white",
          SIZE_CLASSES[size],
          colorForUsername(username)
        )}
        title={username}
      >
        {getInitials(username)}
      </span>

      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-white dark:ring-felt-800",
            isOnline ? "bg-chip-400" : "bg-ink-600/40"
          )}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}
    </span>
  );
}
