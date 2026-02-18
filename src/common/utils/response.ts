import type { Response } from "express";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, status = 200, meta?: PaginationMeta) {
  const body: { success: true; data: T; meta?: PaginationMeta } = {
    success: true,
    data,
  };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function sendError(res: Response, code: string, message: string, status: number) {
  return res.status(status).json({
    success: false,
    error: { code, message, status },
  });
}

export function paginate(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
