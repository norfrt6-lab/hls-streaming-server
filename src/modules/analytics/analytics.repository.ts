import { prisma } from "../../config/database";

export async function getStreamSummary(streamId: string) {
  const sessions = await prisma.streamSession.findMany({
    where: { streamId },
    select: {
      durationSeconds: true,
      peakViewers: true,
      totalUniqueViewers: true,
    },
  });

  const totalSessions = sessions.length;
  const totalWatchHours = sessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0) / 3600, 0);
  const peakViewers = Math.max(0, ...sessions.map((s) => s.peakViewers));
  const avgViewers =
    totalSessions > 0
      ? sessions.reduce((acc, s) => acc + s.totalUniqueViewers, 0) / totalSessions
      : 0;

  return {
    totalSessions,
    totalWatchHours: Math.round(totalWatchHours * 100) / 100,
    avgViewers: Math.round(avgViewers),
    peakViewers,
  };
}

export async function getViewerEvents(streamId: string, params: { page: number; limit: number }) {
  const sessions = await prisma.streamSession.findMany({
    where: { streamId },
    select: { id: true },
  });
  const sessionIds = sessions.map((s) => s.id);

  const [events, total] = await Promise.all([
    prisma.viewerEvent.findMany({
      where: { sessionId: { in: sessionIds } },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.viewerEvent.count({
      where: { sessionId: { in: sessionIds } },
    }),
  ]);

  return { events, total };
}

export async function getStreamSessions(streamId: string, params: { page: number; limit: number }) {
  const [sessions, total] = await Promise.all([
    prisma.streamSession.findMany({
      where: { streamId },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { startedAt: "desc" },
    }),
    prisma.streamSession.count({ where: { streamId } }),
  ]);

  return { sessions, total };
}
