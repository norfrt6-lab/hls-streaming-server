import http from "http";
import { app } from "./app";
import { config } from "./config";
import { logger } from "./common/utils/logger";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { setupSocketServer } from "./services/websocket/socket.server";
import { setupRtmpServer } from "./services/rtmp/rtmp.server";

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

  // Start HTTP server
  server.listen(config.port, () => {
    logger.info(`HTTP server listening on port ${config.port}`);
    logger.info(`RTMP server listening on port ${config.rtmpPort}`);
    logger.info(`Environment: ${config.env}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    server.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
