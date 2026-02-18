import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../common/utils/crypto";
import { AppError } from "../../common/utils/errors";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or invalid authorization header"));
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(AppError.forbidden());
    }
    next();
  };
}
