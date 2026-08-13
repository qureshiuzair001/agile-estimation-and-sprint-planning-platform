/** Generic shape for the simple `{ message: "..." }` responses the API returns. */
export interface MessageResponse {
  message: string;
}

/** Generic shape for API error bodies (ASP.NET default ProblemDetails-like shape). */
export interface ApiErrorResponse {
  title?: string;
  message?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
