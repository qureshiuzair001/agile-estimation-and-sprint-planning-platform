import { NavLink } from "react-router-dom";
import { LayoutGrid, History, Settings, UserCircle, PlusCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { USER_ROLES } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutGrid },
  // Moderator-only — see RoleRoute on this route. Filtered out below for
  // Developer/Tester accounts instead of linking to a page they'd just
  // get redirected away from.
  { to: ROUTES.CREATE_SESSION, label: "New Session", icon: PlusCircle, moderatorOnly: true },
  { to: ROUTES.SESSION_HISTORY, label: "History", icon: History },
  { to: ROUTES.PROFILE, label: "Profile", icon: UserCircle },
  { to: ROUTES.SETTINGS, label: "Settings", icon: Settings },
];

export interface SidebarNavLinksProps {
  onNavigate?: () => void;
}

/** The actual nav links, shared between the desktop Sidebar and the mobile drawer so they never drift out of sync. */
export function SidebarNavLinks({ onNavigate }: SidebarNavLinksProps) {
  const isModerator = useAuthStore((state) => state.user?.role === USER_ROLES.MODERATOR);
  const items = NAV_ITEMS.filter((item) => !item.moderatorOnly || isModerator);

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === ROUTES.DASHBOARD}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-chip-100 text-chip-700 dark:bg-chip-700/20 dark:text-chip-300"
                : "text-ink-700 hover:bg-ink-900/5 dark:text-parchment-200 dark:hover:bg-parchment-50/10"
            )
          }
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Desktop-only sidebar — hidden below `md`, where MobileNavDrawer takes over instead. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-ink-900/5 bg-white px-3 py-6 dark:bg-felt-800 dark:border-parchment-50/10 md:block">
      <SidebarNavLinks />
    </aside>
  );
}
