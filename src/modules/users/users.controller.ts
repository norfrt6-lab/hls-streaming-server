import type { Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { updateUserSchema, updateRoleSchema } from "./users.validator";
import { sendSuccess } from "../../common/utils/response";
import { paginate } from "../../common/utils/response";
import { AppError } from "../../common/utils/errors";
import type { AuthRequest } from "../auth/auth.middleware";

export async function listHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    const { users, total } = await usersService.listUsers({
      page,
      limit,
      role,
      search,
    });
    sendSuccess(res, users, 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await usersService.getUser(req.params.id as string);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = updateUserSchema.parse(req.body);
    const user = await usersService.updateUser(req.params.id as string, input);
    sendSuccess(res, user);
  } catch (err: any) {
    if (err.name === "ZodError")
      return next(AppError.badRequest(err.errors[0]?.message));
    next(err);
  }
}

export async function deleteHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await usersService.deleteUser(req.params.id as string);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

export async function updateRoleHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = updateRoleSchema.parse(req.body);
    const user = await usersService.updateRole(req.params.id as string, input);
    sendSuccess(res, user);
  } catch (err: any) {
    if (err.name === "ZodError")
      return next(AppError.badRequest(err.errors[0]?.message));
    next(err);
  }
}
