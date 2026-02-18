import os from "os";
import * as analyticsRepo from "./analytics.repository";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";

export async function getStreamSummary(streamId: string) {
  return analyticsRepo.getStreamSummary(streamId);
}

export async function getViewerEvents(
  streamId: string,
  params: { page: number; limit: number },
) {
  return analyticsRepo.getViewerEvents(streamId, params);
}

export async function getStreamSessions(
  streamId: string,
  params: { page: number; limit: number },
) {
  return analyticsRepo.getStreamSessions(streamId, params);
}

export async function getDashboardMetrics() {
  const activeStreams = await prisma.stream.count({
    where: { status: "live" },
  });

  // Sum viewer counts from Redis
  const liveStreams = await prisma.stream.findMany({
    where: { status: "live" },
    select: { id: true },
  });
  let totalViewers = 0;
  for (const s of liveStreams) {
    const count = await redis.get(`viewers:${s.id}`);
    totalViewers += parseInt(count ?? "0", 10);
  }

  // System metrics
  const cpus = os.cpus();
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalTick = cpus.reduce(
    (acc, cpu) =>
      acc +
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq,
    0,
  );
  const cpuUsage = 100 - (totalIdle / totalTick) * 100;
  const memUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;

  return {
    cpu: Math.round(cpuUsage * 100) / 100,
    memory: Math.round(memUsage * 100) / 100,
    activeStreams,
    totalViewers,
    bandwidth: 0,
    uptime: process.uptime(),
  };
}
