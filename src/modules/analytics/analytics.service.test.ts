import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./analytics.repository", () => ({
  getStreamSummary: vi.fn(),
  getViewerEvents: vi.fn(),
  getStreamSessions: vi.fn(),
}));

vi.mock("../../config/database", () => ({
  prisma: {
    stream: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../../config/redis", () => ({
  redis: {
    get: vi.fn(),
  },
}));

import * as analyticsService from "./analytics.service";
import * as analyticsRepo from "./analytics.repository";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("analytics.service.getStreamSummary", () => {
  it("delegates to repository", async () => {
    const summary = {
      totalSessions: 5,
      totalWatchHours: 10.5,
      avgViewers: 20,
      peakViewers: 50,
    };
    (analyticsRepo.getStreamSummary as any).mockResolvedValue(summary);

    const result = await analyticsService.getStreamSummary("s1");
    expect(result).toEqual(summary);
  });
});

describe("analytics.service.getViewerEvents", () => {
  it("returns paginated events", async () => {
    (analyticsRepo.getViewerEvents as any).mockResolvedValue({
      events: [],
      total: 0,
    });

    const result = await analyticsService.getViewerEvents("s1", {
      page: 1,
      limit: 20,
    });
    expect(result.events).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("analytics.service.getStreamSessions", () => {
  it("returns paginated sessions", async () => {
    (analyticsRepo.getStreamSessions as any).mockResolvedValue({
      sessions: [],
      total: 0,
    });

    const result = await analyticsService.getStreamSessions("s1", {
      page: 1,
      limit: 20,
    });
    expect(result.sessions).toEqual([]);
  });
});

describe("analytics.service.getDashboardMetrics", () => {
  it("returns active streams, viewer count, CPU and memory", async () => {
    (prisma.stream.count as any).mockResolvedValue(2);
    (prisma.stream.findMany as any).mockResolvedValue([
      { id: "s1" },
      { id: "s2" },
    ]);
    (redis.get as any)
      .mockResolvedValueOnce("10")
      .mockResolvedValueOnce("5");

    const result = await analyticsService.getDashboardMetrics();

    expect(result.activeStreams).toBe(2);
    expect(result.totalViewers).toBe(15);
    expect(typeof result.cpu).toBe("number");
    expect(typeof result.memory).toBe("number");
    expect(typeof result.uptime).toBe("number");
  });

  it("handles zero live streams", async () => {
    (prisma.stream.count as any).mockResolvedValue(0);
    (prisma.stream.findMany as any).mockResolvedValue([]);

    const result = await analyticsService.getDashboardMetrics();
    expect(result.activeStreams).toBe(0);
    expect(result.totalViewers).toBe(0);
  });

  it("handles null Redis viewer counts", async () => {
    (prisma.stream.count as any).mockResolvedValue(1);
    (prisma.stream.findMany as any).mockResolvedValue([{ id: "s1" }]);
    (redis.get as any).mockResolvedValue(null);

    const result = await analyticsService.getDashboardMetrics();
    expect(result.totalViewers).toBe(0);
  });
});
