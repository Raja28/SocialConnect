import { NextResponse } from "next/server";

type Handler<TArgs extends unknown[] = [Request, ...unknown[]]> = (
  ...args: TArgs
) => Promise<Response>;

/**
 * Standardizes unexpected exception handling for route handlers.
 * - Expected errors should still be handled via explicit checks (e.g. supabase `{ error }`).
 * - This only catches thrown exceptions (bad JSON, runtime throws, etc).
 */
export function withErrorHandling<TArgs extends unknown[]>(
  handler: Handler<TArgs>,
): Handler<TArgs> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("Unhandled API error:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

