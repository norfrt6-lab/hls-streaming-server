import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.status);
  }

  logger.error({ err }, "Unhandled error");
  return sendError(res, "INTERNAL_ERROR", "Internal server error", 500);
}
