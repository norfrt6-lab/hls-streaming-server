import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { requestLogger } from "./common/middleware/request-logger";
import { apiLimiter } from "./common/middleware/rate-limiter";
import { errorHandler } from "./common/middleware/error-handler";
import { authRoutes } from "./modules/auth/auth.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { streamsRoutes } from "./modules/streams/streams.routes";
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { vodRoutes } from "./modules/vod/vod.routes";
import { metricsRoutes } from "./services/metrics/metrics.routes";
import { sendSuccess } from "./common/utils/response";

const app = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(requestLogger);
app.use("/api/v1", apiLimiter);

// Static media files
app.use("/media", express.static(config.media.root));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/streams", streamsRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/vod", vodRoutes);
app.use(metricsRoutes);

// Health check
app.get("/api/v1/health", (_req, res) => {
  sendSuccess(res, {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
