export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;

  constructor(code: ErrorCode, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string) {
    return new AppError("VALIDATION_ERROR", message, 400);
  }

  static unauthorized(message = "Authentication required") {
    return new AppError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "Insufficient permissions") {
    return new AppError("FORBIDDEN", message, 403);
  }

  static notFound(message = "Resource not found") {
    return new AppError("NOT_FOUND", message, 404);
  }

  static conflict(message: string) {
    return new AppError("CONFLICT", message, 409);
  }

  static rateLimited(message = "Too many requests", retryAfter?: number) {
    const err = new AppError("RATE_LIMITED", message, 429);
    (err as any).retryAfter = retryAfter;
    return err;
  }

  static internal(message = "Internal server error") {
    return new AppError("INTERNAL_ERROR", message, 500);
  }
}
