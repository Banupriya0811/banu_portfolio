// Application Error Reporting Handler

export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  
  if (process.env.NODE_ENV !== "production") {
    console.error("[App Error]", error, context);
  }
}

