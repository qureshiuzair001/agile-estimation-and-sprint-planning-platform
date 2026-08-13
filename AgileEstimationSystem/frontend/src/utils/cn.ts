import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names (clsx) and resolves conflicting
 * Tailwind utility classes (tailwind-merge). Use this instead of
 * template-string className concatenation anywhere classes are conditional.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
