import http from "http";
import { app } from "./app";
import { config } from "./config";
import { logger } from "./common/utils/logger";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { setupSocketServer, getIO } from "./services/websocket/socket.server";
import { setupRtmpServer } from "./services/rtmp/rtmp.server";
import { stopAllTranscodings } from "./services/transcoding/transcoder";
import { stopAllThumbnailCaptures } from "./modules/thumbnails/thumbnails.service";
import { stopDashboardInterval } from "./services/websocket/dashboard.namespace";
import { startMediaCleanup, stopMediaCleanup } from "./services/media/cleanup.service";

async function main() {
  // Create HTTP server
  const server = http.createServer(app);

  // Setup Socket.IO
  setupSocketServer(server);

  // Setup RTMP server
  setupRtmpServer();

  // Verify database connection
  await prisma.$connect();
  logger.info("Database connected");

  // Start background services
  startMediaCleanup();

  // Start HTTP server
  server.listen(config.port, () => {
    logger.info(`HTTP server listening on port ${config.port}`);
    logger.info(`RTMP server listening on port ${config.rtmpPort}`);
    logger.info(`Environment: ${config.env}`);
  });

  // Graceful shutdown
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`${signal} received, starting graceful shutdown...`);

    // Force exit after 15 seconds if graceful shutdown hangs
    const forceExitTimer = setTimeout(() => {
      logger.error("Graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, 15000);
    forceExitTimer.unref();

    // 1. Stop accepting new HTTP connections
    server.close();

    // 2. Close Socket.IO connections gracefully
    const io = getIO();
    if (io) {
      io.close();
      logger.info("Socket.IO connections closed");
    }

    // 3. Stop background services
    stopMediaCleanup();
    stopDashboardInterval();

    // 4. Stop all active transcodings and thumbnail captures
    stopAllTranscodings();
    stopAllThumbnailCaptures();
    logger.info("Active transcodings and thumbnails stopped");

    // 5. Disconnect database and Redis gracefully
    await prisma.$disconnect();
    logger.info("Database disconnected");

    await redis.quit();
    logger.info("Redis disconnected");

    logger.info("Graceful shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
