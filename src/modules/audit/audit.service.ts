import * as auditRepo from "./audit.repository";
import type { AuditAction, AuditTargetType } from "@prisma/client";

export async function log(
  userId: string,
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
) {
  return auditRepo.create({ userId, action, targetType, targetId, details, ipAddress });
}

export async function listLogs(params: {
  page: number;
  limit: number;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}) {
  return auditRepo.findMany(params);
}
