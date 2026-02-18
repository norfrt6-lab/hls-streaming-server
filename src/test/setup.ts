import { vi } from "vitest";

// Mock database (Prisma)
vi.mock("../../src/config/database", async () => {
  const { prisma } = await import("./mocks/prisma");
  return { prisma };
});

// Mock Redis
vi.mock("../../src/config/redis", async () => {
  const { redis } = await import("./mocks/redis");
  return { redis };
});

// Mock logger (silent in tests)
vi.mock("../../src/common/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));
