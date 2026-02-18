import { describe, it, expect } from "vitest";
import { AppError } from "./errors";

describe("AppError", () => {
  it("should be an instance of Error", () => {
    const err = new AppError("VALIDATION_ERROR", "test", 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("badRequest creates 400 VALIDATION_ERROR", () => {
    const err = AppError.badRequest("bad input");
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("bad input");
  });

  it("unauthorized creates 401 UNAUTHORIZED", () => {
    const err = AppError.unauthorized();
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Authentication required");
  });

  it("forbidden creates 403 FORBIDDEN", () => {
    const err = AppError.forbidden();
    expect(err.status).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Insufficient permissions");
  });

  it("notFound creates 404 NOT_FOUND", () => {
    const err = AppError.notFound("User not found");
    expect(err.status).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("User not found");
  });

  it("conflict creates 409 CONFLICT", () => {
    const err = AppError.conflict("Already exists");
    expect(err.status).toBe(409);
    expect(err.code).toBe("CONFLICT");
    expect(err.message).toBe("Already exists");
  });

  it("rateLimited creates 429 RATE_LIMITED with retryAfter", () => {
    const err = AppError.rateLimited("Slow down", 60);
    expect(err.status).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
    expect((err as any).retryAfter).toBe(60);
  });

  it("internal creates 500 INTERNAL_ERROR", () => {
    const err = AppError.internal();
    expect(err.status).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.message).toBe("Internal server error");
  });
});
