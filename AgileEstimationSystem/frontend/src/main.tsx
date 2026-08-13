import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
  // Lets an individual query opt into a side-effect on failure via
  // `meta: { onError: () => ... }` (used by useCurrentUser to clear an
  // invalid session) without every query needing its own error handling.
  queryCache: new QueryCache({
    onError: (error, query) => {
      query.meta?.onError instanceof Function && query.meta.onError(error);
    },
  }),
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element (#root) was not found in index.html. Cannot mount the app."
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#123833",
              color: "#F7F8F5",
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: "#E8A33D", secondary: "#123833" } },
            error: { iconTheme: { primary: "#D65A4A", secondary: "#123833" } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
