import type { Response, NextFunction } from "express";
import * as auditService from "./audit.service";
import { sendSuccess, paginate } from "../../common/utils/response";
import type { AuthRequest } from "../auth/auth.middleware";
import type { AuditAction } from "@prisma/client";

export async function listHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const action = req.query.action as AuditAction | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const { logs, total } = await auditService.listLogs({
      page,
      limit,
      action,
      startDate,
      endDate,
    });
    sendSuccess(res, logs, 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
}
