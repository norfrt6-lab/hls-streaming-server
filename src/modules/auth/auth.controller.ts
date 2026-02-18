import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { sendSuccess } from "../../common/utils/response";
import { AppError } from "../../common/utils/errors";
import type { AuthRequest } from "./auth.middleware";

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    sendSuccess(res, { message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) return next(AppError.unauthorized());
    const user = await authService.getMe(req.userId);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
