import type { Namespace } from "socket.io";
import os from "os";
import { logger } from "../../common/utils/logger";
import { getActiveTranscodings } from "../transcoding/transcoder";
import { redis } from "../../config/redis";

let dashboardInterval: NodeJS.Timeout | null = null;

async function getTotalViewers(): Promise<number> {
  const keys = await redis.keys("viewers:*");
  // Filter out peak keys
  const viewerKeys = keys.filter((k) => !k.includes(":peak:"));
  if (viewerKeys.length === 0) return 0;

  const values = await redis.mget(...viewerKeys);
  return values.reduce((sum, val) => sum + (parseInt(val ?? "0", 10) || 0), 0);
}

export function setupDashboardNamespace(dashboardNsp: Namespace) {
  dashboardNsp.on("connection", (socket) => {
    logger.debug({ userId: socket.data.userId }, "User connected to dashboard");

    socket.on("disconnect", () => {
      logger.debug({ userId: socket.data.userId }, "User disconnected from dashboard");
    });
  });

  // Broadcast system metrics every 5 seconds
  if (!dashboardInterval) {
    dashboardInterval = setInterval(async () => {
      if (dashboardNsp.sockets.size === 0) return;

      const cpus = os.cpus();
      const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const totalTick = cpus.reduce(
        (acc, cpu) =>
          acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq,
        0,
      );
      const cpuUsage = 100 - (totalIdle / totalTick) * 100;

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsage = ((totalMem - freeMem) / totalMem) * 100;

      const activeStreams = getActiveTranscodings().length;
      const totalViewers = await getTotalViewers();

      dashboardNsp.emit("dashboard:metrics", {
        cpu: Math.round(cpuUsage * 100) / 100,
        memory: Math.round(memUsage * 100) / 100,
        activeStreams,
        totalViewers,
        bandwidth: 0, // Requires Nginx access log parsing for accurate measurement
        uptime: process.uptime(),
      });
    }, 5000);
  }
}

export function stopDashboardInterval() {
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
    dashboardInterval = null;
  }
}

export function emitDashboardStream(
  dashboardNsp: Namespace,
  data: {
    streamId: string;
    viewers: number;
    bitrate: number;
    fps: number;
    duration: number;
    health: "good" | "warning" | "critical";
  },
) {
  dashboardNsp.emit("dashboard:stream", data);
}
