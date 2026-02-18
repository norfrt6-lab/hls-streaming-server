import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, refreshSchema } from "./auth.validator";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      username: "alice",
      email: "alice@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      email: "a@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      username: "alice",
      email: "alice@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid username characters", () => {
    const result = registerSchema.safeParse({
      username: "user name!",
      email: "a@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("refreshSchema", () => {
  it("accepts valid refresh token", () => {
    const result = refreshSchema.safeParse({ refreshToken: "some-token" });
    expect(result.success).toBe(true);
  });

  it("rejects empty refresh token", () => {
    const result = refreshSchema.safeParse({ refreshToken: "" });
    expect(result.success).toBe(false);
  });
});
