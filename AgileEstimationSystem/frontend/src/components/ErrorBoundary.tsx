import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere below it in the tree and shows a
 * recoverable fallback instead of the blank white screen React leaves
 * behind by default. This is deliberately mounted once, high up in
 * main.tsx (outside the router), so a crash in any single page can't
 * take down navigation, auth state, or the toast/query providers with it.
 *
 * Error boundaries only catch render/lifecycle errors — not errors in
 * event handlers, async code, or SignalR callbacks. Those are already
 * handled at their own call sites (see axiosClient.ts's response
 * interceptor and the try/catch blocks around each hub invoke in
 * PlanningRoomPage) rather than here.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A real logging/telemetry sink (e.g. Sentry, Application Insights)
    // is the natural next step here — see Part 3/README follow-ups.
    console.error("Unhandled render error caught by ErrorBoundary:", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment-50 p-6 text-center dark:bg-felt-900">
          <div className="flex size-14 items-center justify-center rounded-full bg-coral-500/10 text-coral-500">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink-900 dark:text-parchment-50">
              Something went wrong
            </h1>
            <p className="mt-2 max-w-sm text-sm text-ink-600 dark:text-parchment-200/70">
              This part of the app hit an unexpected error. Reloading usually fixes it — if it
              keeps happening, let us know what you were doing when it broke.
            </p>
          </div>
          <Button onClick={this.handleReload}>Reload the app</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
