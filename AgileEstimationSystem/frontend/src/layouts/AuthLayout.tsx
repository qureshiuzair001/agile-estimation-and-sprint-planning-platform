import type { ReactNode } from "react";
import { Spade } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-felt-texture">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-chip-400 shadow-chip">
              <Spade className="size-6 text-felt-900" aria-hidden="true" />
            </span>
            <h1 className="font-display text-2xl font-semibold text-parchment-50">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-parchment-200/70">{subtitle}</p>}
          </div>

          <div className="rounded-card bg-white p-6 shadow-card-hover dark:bg-felt-800">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
