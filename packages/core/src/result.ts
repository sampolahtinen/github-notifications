/**
 * Failure codes for expected domain errors
 */
export type FailureCode =
  | "AUTH"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "UPSTREAM"
  | "CANCELLED";

/**
 * Failure structure for expected domain errors
 */
export type Failure = {
  code: FailureCode;
  message: string;
  meta?: Record<string, string>;
  cause?: unknown;
};

/**
 * Result type for operations that can fail
 */
export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = Failure> = Ok<T> | Err<E>;

/**
 * Create a successful result
 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Create a failure result
 */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

/**
 * Create a Failure from an HTTP status code
 */
export function failureFromStatus(
  status: number,
  message: string,
  meta?: Record<string, string>,
): Failure {
  const codeMap: Record<number, FailureCode> = {
    401: "AUTH",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    408: "TIMEOUT",
    409: "CONFLICT",
    422: "INVALID",
    429: "RATE_LIMIT",
    502: "UPSTREAM",
    503: "NETWORK",
  };

  return {
    code: codeMap[status] ?? "UPSTREAM",
    message,
    meta,
  };
}

/**
 * Create a Failure for network errors
 */
export function networkFailure(cause?: unknown): Failure {
  return {
    code: "NETWORK",
    message: "Network error. Check your internet connection.",
    cause,
  };
}

/**
 * Create a Failure for auth errors
 */
export function authFailure(message = "GitHub token not configured"): Failure {
  return {
    code: "AUTH",
    message,
  };
}

/**
 * Create a Failure for rate limit errors
 */
export function rateLimitFailure(resetAt?: string): Failure {
  return {
    code: "RATE_LIMIT",
    message: resetAt
      ? `Rate limited. Resets at ${resetAt}`
      : "Rate limited. Please try again later.",
    meta: resetAt ? { resetAt } : undefined,
  };
}
