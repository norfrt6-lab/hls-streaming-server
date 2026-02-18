import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./users.repository", () => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import * as usersService from "./users.service";
import * as usersRepo from "./users.repository";

const mockUser = {
  id: "u1",
  username: "alice",
  email: "alice@example.com",
  displayName: "Alice",
  avatarUrl: null,
  role: "viewer",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("users.service.listUsers", () => {
  it("returns paginated users", async () => {
    (usersRepo.findMany as any).mockResolvedValue({
      users: [mockUser],
      total: 1,
    });

    const result = await usersService.listUsers({ page: 1, limit: 20 });
    expect(result.users).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});

describe("users.service.getUser", () => {
  it("returns user by id", async () => {
    (usersRepo.findById as any).mockResolvedValue(mockUser);
    const result = await usersService.getUser("u1");
    expect(result.id).toBe("u1");
  });

  it("throws notFound for missing user", async () => {
    (usersRepo.findById as any).mockResolvedValue(null);
    await expect(usersService.getUser("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("users.service.updateUser", () => {
  it("updates user fields", async () => {
    (usersRepo.findById as any).mockResolvedValue(mockUser);
    (usersRepo.update as any).mockResolvedValue({
      ...mockUser,
      displayName: "Bob",
    });

    const result = await usersService.updateUser("u1", {
      displayName: "Bob",
    });
    expect(result.displayName).toBe("Bob");
  });

  it("throws notFound for missing user", async () => {
    (usersRepo.findById as any).mockResolvedValue(null);
    await expect(usersService.updateUser("nope", { displayName: "X" })).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("users.service.deleteUser", () => {
  it("deletes existing user", async () => {
    (usersRepo.findById as any).mockResolvedValue(mockUser);
    (usersRepo.remove as any).mockResolvedValue(undefined);

    await expect(usersService.deleteUser("u1")).resolves.toBeUndefined();
  });

  it("throws notFound for missing user", async () => {
    (usersRepo.findById as any).mockResolvedValue(null);
    await expect(usersService.deleteUser("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("users.service.updateRole", () => {
  it("changes user role", async () => {
    (usersRepo.findById as any).mockResolvedValue(mockUser);
    (usersRepo.update as any).mockResolvedValue({
      ...mockUser,
      role: "admin",
    });

    const result = await usersService.updateRole("u1", { role: "admin" });
    expect(result.role).toBe("admin");
  });

  it("throws notFound for missing user", async () => {
    (usersRepo.findById as any).mockResolvedValue(null);
    await expect(usersService.updateRole("nope", { role: "admin" })).rejects.toMatchObject({
      status: 404,
    });
  });
});
