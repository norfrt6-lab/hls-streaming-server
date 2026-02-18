import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "./error-handler";
import { AppError } from "../utils/errors";

vi.mock("../utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  it("handles AppError with correct status and format", () => {
    const err = AppError.notFound("Item not found");
    const res = createMockRes();
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "NOT_FOUND", message: "Item not found", status: 404 },
    });
  });

  it("handles unknown Error as 500", () => {
    const err = new Error("something broke");
    const res = createMockRes();
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        status: 500,
      },
    });
  });

  it("handles 400 validation errors", () => {
    const err = AppError.badRequest("Invalid email");
    const res = createMockRes();
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid email",
        status: 400,
      },
    });
  });

  it("handles 401 unauthorized errors", () => {
    const err = AppError.unauthorized("Token expired");
    const res = createMockRes();
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("handles 403 forbidden errors", () => {
    const err = AppError.forbidden("Admin only");
    const res = createMockRes();
    errorHandler(err, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
