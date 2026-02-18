import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError, paginate } from "./response";

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("sendSuccess", () => {
  it("sends success response with default 200 status", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
    });
  });

  it("sends success response with custom status", () => {
    const res = createMockRes();
    sendSuccess(res, { id: 1 }, 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("includes meta when provided", () => {
    const res = createMockRes();
    const meta = { page: 1, limit: 20, total: 50, totalPages: 3 };
    sendSuccess(res, [1, 2, 3], 200, meta);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [1, 2, 3],
      meta,
    });
  });
});

describe("sendError", () => {
  it("sends error response with correct format", () => {
    const res = createMockRes();
    sendError(res, "NOT_FOUND", "User not found", 404);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found", status: 404 },
    });
  });
});

describe("paginate", () => {
  it("calculates totalPages correctly", () => {
    expect(paginate(1, 20, 50)).toEqual({
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
    });
  });

  it("handles exact division", () => {
    expect(paginate(1, 10, 30).totalPages).toBe(3);
  });

  it("handles zero total", () => {
    expect(paginate(1, 20, 0).totalPages).toBe(0);
  });

  it("handles total less than limit", () => {
    expect(paginate(1, 20, 5).totalPages).toBe(1);
  });
});
