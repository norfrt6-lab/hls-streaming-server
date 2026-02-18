import { describe, it, expect, vi } from "vitest";
import { authenticate, authorize } from "./auth.middleware";
import { signAccessToken } from "../../common/utils/crypto";
import { AppError } from "../../common/utils/errors";

describe("authenticate", () => {
  it("calls next with 401 when no authorization header", () => {
    const req = { headers: {} } as any;
    const next = vi.fn();
    authenticate(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(401);
  });

  it("calls next with 401 for malformed header (no Bearer)", () => {
    const req = { headers: { authorization: "Token abc" } } as any;
    const next = vi.fn();
    authenticate(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
  });

  it("calls next with 401 for invalid token", () => {
    const req = { headers: { authorization: "Bearer invalid.token" } } as any;
    const next = vi.fn();
    authenticate(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Invalid or expired token");
  });

  it("sets userId and userRole for valid token", () => {
    const token = signAccessToken({ userId: "u1", role: "admin" });
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const next = vi.fn();
    authenticate(req, {} as any, next);

    expect(req.userId).toBe("u1");
    expect(req.userRole).toBe("admin");
    expect(next).toHaveBeenCalledWith();
  });
});

describe("authorize", () => {
  it("calls next() when role matches", () => {
    const req = { userRole: "admin" } as any;
    const next = vi.fn();
    authorize("admin")(req, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next with 403 when role does not match", () => {
    const req = { userRole: "viewer" } as any;
    const next = vi.fn();
    authorize("admin")(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(403);
  });

  it("allows any of multiple roles", () => {
    const req = { userRole: "streamer" } as any;
    const next = vi.fn();
    authorize("admin", "streamer")(req, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects when no role on request", () => {
    const req = {} as any;
    const next = vi.fn();
    authorize("admin")(req, {} as any, next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(403);
  });
});
