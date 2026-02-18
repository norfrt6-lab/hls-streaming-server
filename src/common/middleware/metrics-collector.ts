import type { Request, Response, NextFunction } from "express";
import { httpRequestsTotal, httpRequestDuration } from "../../services/metrics/metrics.service";

export function metricsCollector(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationSec = durationNs / 1e9;

    // Normalize path to avoid high-cardinality labels (e.g. /streams/:id -> /streams/:id)
    const route = req.route?.path ?? req.path;
    const basePath = `/api/v1${route}`;

    httpRequestsTotal.inc({
      method: req.method,
      path: basePath,
      status: String(res.statusCode),
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        path: basePath,
      },
      durationSec,
    );
  });

  next();
}
