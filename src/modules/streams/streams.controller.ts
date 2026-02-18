import type { Response, NextFunction } from "express";
import * as streamsService from "./streams.service";
import { sendSuccess, paginate } from "../../common/utils/response";
import type { AuthRequest } from "../auth/auth.middleware";

export async function listHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const userId = req.query.userId as string | undefined;

    const { streams, total } = await streamsService.listStreams({
      page,
      limit,
      status,
      search,
      userId,
    });
    sendSuccess(res, streams, 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stream = await streamsService.getStream(req.params.id as string);
    sendSuccess(res, stream);
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stream = await streamsService.createStream(req.userId!, req.body);
    sendSuccess(res, stream, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stream = await streamsService.updateStream(
      req.params.id as string,
      req.userId!,
      req.userRole!,
      req.body,
    );
    sendSuccess(res, stream);
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await streamsService.deleteStream(req.params.id as string, req.userId!, req.userRole!);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

export async function getKeyHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await streamsService.getStreamKey(
      req.params.id as string,
      req.userId!,
      req.userRole!,
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function regenerateKeyHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await streamsService.regenerateStreamKey(
      req.params.id as string,
      req.userId!,
      req.userRole!,
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function forceStopHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stream = await streamsService.forceStopStream(req.params.id as string, req.userId);
    sendSuccess(res, stream);
  } catch (err) {
    next(err);
  }
}
