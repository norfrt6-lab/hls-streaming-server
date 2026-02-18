import type { Namespace } from "socket.io";
import os from "os";
import { logger } from "../../common/utils/logger";

let dashboardInterval: NodeJS.Timeout | null = null;

export function setupDashboardNamespace(dashboardNsp: Namespace) {
  dashboardNsp.on("connection", (socket) => {
    logger.debug({ userId: socket.data.userId }, "User connected to dashboard");

    socket.on("disconnect", () => {
      logger.debug({ userId: socket.data.userId }, "User disconnected from dashboard");
    });
  });

  // Broadcast system metrics every 5 seconds
  if (!dashboardInterval) {
    dashboardInterval = setInterval(() => {
      if (dashboardNsp.sockets.size === 0) return;

      const cpus = os.cpus();
      const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const totalTick = cpus.reduce(
        (acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq,
        0,
      );
      const cpuUsage = 100 - (totalIdle / totalTick) * 100;

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memUsage = ((totalMem - freeMem) / totalMem) * 100;

      dashboardNsp.emit("dashboard:metrics", {
        cpu: Math.round(cpuUsage * 100) / 100,
        memory: Math.round(memUsage * 100) / 100,
        activeStreams: 0, // Updated by RTMP events
        totalViewers: 0, // Updated by stream viewer tracking
        bandwidth: 0,
        uptime: process.uptime(),
      });
    }, 5000);
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
