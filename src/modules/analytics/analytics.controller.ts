import type { Response, NextFunction } from "express";
import * as analyticsService from "./analytics.service";
import { sendSuccess, paginate } from "../../common/utils/response";
import type { AuthRequest } from "../auth/auth.middleware";

export async function summaryHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const summary = await analyticsService.getStreamSummary(
      req.params.streamId as string,
    );
    sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
}

export async function viewersHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { events, total } = await analyticsService.getViewerEvents(
      req.params.streamId as string,
      { page, limit },
    );
    sendSuccess(res, events, 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function sessionsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { sessions, total } = await analyticsService.getStreamSessions(
      req.params.streamId as string,
      { page, limit },
    );
    sendSuccess(res, sessions, 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function dashboardHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const metrics = await analyticsService.getDashboardMetrics();
    sendSuccess(res, metrics);
  } catch (err) {
    next(err);
  }
}
