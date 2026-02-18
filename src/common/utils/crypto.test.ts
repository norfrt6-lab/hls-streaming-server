import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  generateStreamKey,
  hashStreamKey,
} from "./crypto";

describe("password hashing", () => {
  it("hashPassword returns a different value than the input", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash).not.toBe("mypassword");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("verifyPassword returns true for correct password", async () => {
    const hash = await hashPassword("secret123");
    const result = await verifyPassword("secret123", hash);
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for wrong password", async () => {
    const hash = await hashPassword("secret123");
    const result = await verifyPassword("wrong", hash);
    expect(result).toBe(false);
  });
});

describe("JWT tokens", () => {
  it("signAccessToken creates a verifiable token", () => {
    const token = signAccessToken({ userId: "u1", role: "admin" });
    expect(typeof token).toBe("string");
    const payload = verifyToken(token);
    expect(payload.userId).toBe("u1");
    expect(payload.role).toBe("admin");
  });

  it("signRefreshToken creates a verifiable token", () => {
    const token = signRefreshToken({ userId: "u2" });
    expect(typeof token).toBe("string");
    const payload = verifyToken(token);
    expect(payload.userId).toBe("u2");
  });

  it("verifyToken throws for invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});

describe("stream key", () => {
  it("generateStreamKey returns a UUID format string", () => {
    const key = generateStreamKey();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("hashStreamKey returns a consistent SHA256 hex", () => {
    const hash1 = hashStreamKey("my-key");
    const hash2 = hashStreamKey("my-key");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("hashStreamKey returns different hashes for different keys", () => {
    const hash1 = hashStreamKey("key-a");
    const hash2 = hashStreamKey("key-b");
    expect(hash1).not.toBe(hash2);
  });
});
