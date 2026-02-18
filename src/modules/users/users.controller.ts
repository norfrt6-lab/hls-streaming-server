import type { Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { sendSuccess, paginate } from "../../common/utils/response";
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
    const user = await usersService.updateUser(
      req.params.id as string,
      req.body,
    );
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await usersService.deleteUser(req.params.id as string, req.userId);
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
    const user = await usersService.updateRole(
      req.params.id as string,
      req.body,
      req.userId,
    );
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
