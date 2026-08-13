/**
 * Central place to read environment variables.
 * Import `env` anywhere instead of touching `import.meta.env` directly,
 * so there is exactly one place to fix if a variable is renamed.
 */

function readEnvVar(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key] ?? fallback;

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Did you copy .env.example to .env?`
    );
  }

  return value;
}

export const env = {
  apiBaseUrl: readEnvVar("VITE_API_BASE_URL", "https://localhost:7001"),
  signalrHubUrl: readEnvVar(
    "VITE_SIGNALR_HUB_URL",
    "https://localhost:7001/hubs/planning-poker"
  ),
} as const;
