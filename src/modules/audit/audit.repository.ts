import { prisma } from "../../config/database";
import type { AuditAction, AuditTargetType } from "@prisma/client";

export async function create(data: {
  userId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  details?: any;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data });
}

export async function findMany(params: {
  page: number;
  limit: number;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};

  if (params.action) {
    where.action = params.action;
  }

  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) where.createdAt.gte = new Date(params.startDate);
    if (params.endDate) where.createdAt.lte = new Date(params.endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, displayName: true },
        },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
