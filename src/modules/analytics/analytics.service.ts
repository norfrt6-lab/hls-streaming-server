import * as analyticsRepo from "./analytics.repository";

export async function getStreamSummary(streamId: string) {
  return analyticsRepo.getStreamSummary(streamId);
}

export async function getViewerEvents(streamId: string, params: { page: number; limit: number }) {
  return analyticsRepo.getViewerEvents(streamId, params);
}

export async function getStreamSessions(streamId: string, params: { page: number; limit: number }) {
  return analyticsRepo.getStreamSessions(streamId, params);
}

export async function getDashboardMetrics() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const [activeStreams, totalUsers] = await Promise.all([
      prisma.stream.count({ where: { status: "live" } }),
      prisma.user.count(),
    ]);

    return {
      cpu: 0,
      memory: 0,
      activeStreams,
      totalViewers: 0,
      bandwidth: 0,
      uptime: process.uptime(),
    };
  } finally {
    await prisma.$disconnect();
  }
}
