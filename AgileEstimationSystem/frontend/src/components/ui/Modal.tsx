import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable modal/dialog. Renders into a portal so it always sits above
 * app content regardless of where it's mounted, closes on Escape and
 * on overlay click, and traps scroll on the body while open.
 */
export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-card bg-white p-4 shadow-card-hover sm:p-6",
              "dark:bg-felt-800",
              className
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="modal-title" className="font-display text-lg font-semibold text-ink-900 dark:text-parchment-50 sm:text-xl">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/70">{description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 rounded-md p-1 text-ink-600 hover:bg-ink-900/5 dark:text-parchment-200 dark:hover:bg-parchment-50/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
