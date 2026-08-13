import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-chip-400 text-felt-900 hover:bg-chip-500 shadow-chip disabled:hover:bg-chip-400",
  secondary:
    "bg-felt-700 text-parchment-50 hover:bg-felt-600 disabled:hover:bg-felt-700",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-900/5 dark:text-parchment-100 dark:hover:bg-parchment-50/10",
  danger: "bg-coral-500 text-parchment-50 hover:bg-coral-600 disabled:hover:bg-coral-500",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * The single reusable Button used across the whole app.
 * `primary` (gold) is reserved for the one main action per screen —
 * e.g. "Reveal Votes", "Create Session" — never use it for two
 * competing actions in the same view.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium",
          "transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
