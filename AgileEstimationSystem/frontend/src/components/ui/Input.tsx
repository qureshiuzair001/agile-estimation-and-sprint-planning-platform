import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

/**
 * Reusable text input. Designed to be passed straight into
 * react-hook-form's `register()` via ref forwarding.
 *
 * Usage: <Input label="Email" error={errors.email?.message} {...register("email")} />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, className, ...rest }, ref) => {
    const inputId = id ?? rest.name;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink-700 dark:text-parchment-100"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-600 dark:text-parchment-200/60">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              "h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink-900",
              "placeholder:text-ink-600/50",
              "border-ink-900/10 focus:border-chip-400",
              "dark:bg-felt-800 dark:text-parchment-50 dark:border-parchment-50/15",
              icon && "pl-9",
              error && "border-coral-500 focus:border-coral-500",
              className
            )}
            {...rest}
          />
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-coral-500">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-ink-600/70 dark:text-parchment-200/60">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
