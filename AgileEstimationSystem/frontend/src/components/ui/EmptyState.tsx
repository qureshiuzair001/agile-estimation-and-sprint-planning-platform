import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-900/10 px-6 py-14 text-center dark:border-parchment-50/15">
      {icon && <div className="mb-4 text-ink-600/50 dark:text-parchment-200/40">{icon}</div>}

      <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-parchment-50">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-600 dark:text-parchment-200/70">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
