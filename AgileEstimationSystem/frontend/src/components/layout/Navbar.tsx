import { LogOut, Spade, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";

export interface NavbarProps {
  onMenuClick: () => void;
}

/**
 * Sign-out now calls the real /auth/logout endpoint to revoke the
 * refresh token server-side, via useLogout (see hooks/useAuth.ts) —
 * previously this only cleared local state because the backend had no
 * logout/token-revocation endpoint at all (see backend review, item 15).
 */
export function Navbar({ onMenuClick }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-900/5 bg-white px-4 dark:bg-felt-800 dark:border-parchment-50/10 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-ink-600 hover:bg-ink-900/5 dark:text-parchment-200 dark:hover:bg-parchment-50/10 md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <Spade className="size-5 text-chip-500" aria-hidden="true" />
          <span className="hidden font-display text-base font-semibold text-ink-900 dark:text-parchment-50 sm:inline">
            Agile Estimation
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2.5">
            <Avatar username={user.username} size="sm" />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none text-ink-900 dark:text-parchment-50">
                {user.username}
              </p>
              <p className="mt-0.5 text-xs text-ink-600/70 dark:text-parchment-200/60">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => logout()}
          disabled={isPending}
          aria-label="Sign out"
          className="rounded-md p-2 text-ink-600 hover:bg-ink-900/5 disabled:opacity-50 dark:text-parchment-200 dark:hover:bg-parchment-50/10"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
