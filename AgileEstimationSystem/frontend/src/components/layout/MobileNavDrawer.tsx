import { AnimatePresence, motion } from "framer-motion";
import { X, Spade } from "lucide-react";
import { SidebarNavLinks } from "@/components/layout/Sidebar";

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Shown only below `md` — the desktop <Sidebar/> is hidden at that breakpoint, so this is the only way to reach nav links on a phone. */
export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-900/50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 flex w-64 flex-col gap-6 bg-white p-4 shadow-card-hover dark:bg-felt-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Spade className="size-5 text-chip-500" aria-hidden="true" />
                <span className="font-display text-base font-semibold text-ink-900 dark:text-parchment-50">
                  Agile Estimation
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-ink-600 hover:bg-ink-900/5 dark:text-parchment-200 dark:hover:bg-parchment-50/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <SidebarNavLinks onNavigate={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
