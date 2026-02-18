import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validate } from "./validate";
import { AppError } from "../utils/errors";

function createMockReq(overrides: any = {}) {
  return { body: {}, query: {}, params: {}, ...overrides } as any;
}

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().int().positive(),
  });

  it("passes valid body and calls next()", () => {
    const req = createMockReq({ body: { name: "Alice", age: 25 } });
    const res = {} as any;
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "Alice", age: 25 });
  });

  it("calls next with AppError for invalid body", () => {
    const req = createMockReq({ body: { name: "", age: -1 } });
    const res = {} as any;
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(400);
  });

  it("uses the first Zod error message", () => {
    const req = createMockReq({ body: { name: "", age: 1 } });
    const res = {} as any;
    const next = vi.fn();

    validate(schema)(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err.message).toBe("Name is required");
  });

  it("validates query source", () => {
    const querySchema = z.object({ page: z.string() });
    const req = createMockReq({ query: { page: "1" } });
    const res = {} as any;
    const next = vi.fn();

    validate(querySchema, "query")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("validates params source", () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const req = createMockReq({
      params: { id: "550e8400-e29b-41d4-a716-446655440000" },
    });
    const res = {} as any;
    const next = vi.fn();

    validate(paramsSchema, "params")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
