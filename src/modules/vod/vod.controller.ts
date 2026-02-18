import type { Response, NextFunction } from "express";
import * as vodService from "./vod.service";
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
    const search = req.query.search as string | undefined;

    const { recordings, total } = await vodService.listRecordings({
      page,
      limit,
      search,
    });
    sendSuccess(res, recordings, 200, paginate(page, limit, total));
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
    const recording = await vodService.getRecording(req.params.id as string);
    sendSuccess(res, recording);
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
    await vodService.deleteRecording(req.params.id as string);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

export async function manifestHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const manifest = await vodService.getManifest(req.params.id as string);
    sendSuccess(res, manifest);
  } catch (err) {
    next(err);
  }
}
