import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { correlationId } from "./common/middleware/correlation-id";
import { requestLogger } from "./common/middleware/request-logger";
import { metricsCollector } from "./common/middleware/metrics-collector";
import { apiLimiter } from "./common/middleware/rate-limiter";
import { errorHandler } from "./common/middleware/error-handler";
import { authRoutes } from "./modules/auth/auth.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { streamsRoutes } from "./modules/streams/streams.routes";
import { chatAdminRoutes } from "./modules/chat/chat.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { vodRoutes } from "./modules/vod/vod.routes";
import { auditRoutes } from "./modules/audit/audit.routes";
import { metricsRoutes } from "./services/metrics/metrics.routes";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { sendSuccess } from "./common/utils/response";

const app = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(correlationId);
app.use(requestLogger);
app.use(metricsCollector);
app.use("/api/v1", apiLimiter);

// Static media files with cache headers
app.use(
  "/media",
  express.static(config.media.root, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".m3u8")) {
        // Playlists change constantly during live streams
        res.setHeader("Cache-Control", "no-cache, no-store");
      } else if (filePath.endsWith(".ts")) {
        // HLS segments are immutable once written
        res.setHeader("Cache-Control", "public, max-age=86400, immutable");
      } else if (filePath.endsWith(".jpg") || filePath.endsWith(".png")) {
        // Thumbnails refresh every 30 seconds
        res.setHeader("Cache-Control", "public, max-age=10");
      }
    },
  }),
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/streams", streamsRoutes);
app.use("/api/v1/chat", chatAdminRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/vod", vodRoutes);
app.use("/api/v1/audit", auditRoutes);
app.use(metricsRoutes);

// Health check with dependency verification
app.get("/api/v1/health", async (_req, res) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    checks.database = "ok";
  } catch {
    checks.database = "down";
    healthy = false;
  }

  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "down";
    healthy = false;
  }

  const payload = {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };

  sendSuccess(res, payload, healthy ? 200 : 503);
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
