import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../common/utils/errors";

// Mock crypto module
vi.mock("../../common/utils/crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  verifyPassword: vi.fn(),
  signAccessToken: vi.fn().mockReturnValue("access_token"),
  signRefreshToken: vi.fn().mockReturnValue("refresh_token"),
  verifyToken: vi.fn(),
}));

// Mock prisma
vi.mock("../../config/database", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock redis
vi.mock("../../config/redis", () => ({
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}));

import * as authService from "./auth.service";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { verifyPassword, verifyToken } from "../../common/utils/crypto";

const mockUser = {
  id: "u1",
  username: "testuser",
  email: "test@example.com",
  password: "hashed_password",
  role: "viewer",
  isActive: true,
  displayName: null,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth.service.register", () => {
  it("creates a user and returns tokens", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue(mockUser);

    const result = await authService.register({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user).not.toHaveProperty("password");
    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("refresh_token");
    expect(redis.set).toHaveBeenCalled();
  });

  it("throws conflict on duplicate email", async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce(mockUser);

    await expect(
      authService.register({
        username: "other",
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
  });

  it("throws conflict on duplicate username", async () => {
    (prisma.user.findUnique as any)
      .mockResolvedValueOnce(null) // email check passes
      .mockResolvedValueOnce(mockUser); // username check fails

    await expect(
      authService.register({
        username: "testuser",
        email: "new@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe("auth.service.login", () => {
  it("returns tokens for valid credentials", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (verifyPassword as any).mockResolvedValue(true);

    const result = await authService.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("refresh_token");
    expect(result.user).not.toHaveProperty("password");
  });

  it("throws unauthorized for unknown email", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await expect(
      authService.login({ email: "no@example.com", password: "pass" }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("throws forbidden for inactive user", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    await expect(
      authService.login({ email: "test@example.com", password: "pass" }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("throws unauthorized for wrong password", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (verifyPassword as any).mockResolvedValue(false);

    await expect(
      authService.login({ email: "test@example.com", password: "wrong" }),
    ).rejects.toMatchObject({ status: 401 });
  });
});

describe("auth.service.refresh", () => {
  it("returns new tokens for valid refresh token", async () => {
    (redis.get as any).mockResolvedValue("u1");
    (verifyToken as any).mockReturnValue({ userId: "u1" });
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const result = await authService.refresh("old_refresh_token");

    expect(result.accessToken).toBe("access_token");
    expect(result.refreshToken).toBe("refresh_token");
    expect(redis.del).toHaveBeenCalled();
  });

  it("throws unauthorized when token not in Redis", async () => {
    (redis.get as any).mockResolvedValue(null);

    await expect(authService.refresh("bad_token")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws unauthorized for invalid JWT", async () => {
    (redis.get as any).mockResolvedValue("u1");
    (verifyToken as any).mockImplementation(() => {
      throw new Error("invalid");
    });

    await expect(authService.refresh("expired_token")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws unauthorized for inactive user", async () => {
    (redis.get as any).mockResolvedValue("u1");
    (verifyToken as any).mockReturnValue({ userId: "u1" });
    (prisma.user.findUnique as any).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    await expect(authService.refresh("token")).rejects.toMatchObject({
      status: 401,
    });
  });
});

describe("auth.service.logout", () => {
  it("deletes refresh token from Redis", async () => {
    await authService.logout("my_refresh_token");
    expect(redis.del).toHaveBeenCalledWith("refresh:my_refresh_token");
  });
});

describe("auth.service.getMe", () => {
  it("returns user without password", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const result = await authService.getMe("u1");
    expect(result).not.toHaveProperty("password");
    expect(result.id).toBe("u1");
  });

  it("throws notFound for missing user", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await expect(authService.getMe("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});
