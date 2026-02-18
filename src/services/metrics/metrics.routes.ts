import { Router } from "express";
import type { Request, Response } from "express";
import { promClient } from "./metrics.service";

const router = Router();

router.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", promClient.register.contentType);
  const metrics = await promClient.register.metrics();
  res.end(metrics);
});

export { router as metricsRoutes };
