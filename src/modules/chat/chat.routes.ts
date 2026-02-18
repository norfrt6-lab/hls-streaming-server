import { Router } from "express";
import type { Response, NextFunction } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import * as chatService from "./chat.service";
import { sendSuccess, paginate } from "../../common/utils/response";
import type { AuthRequest } from "../auth/auth.middleware";

const router = Router({ mergeParams: true });

// GET /streams/:id/chat
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const streamId = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { messages, total } = await chatService.getMessages(streamId, {
      page,
      limit,
    });
    sendSuccess(res, messages, 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
});

// POST /streams/:id/chat/ban
router.post(
  "/ban",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const streamId = req.params.id as string;
      const { userId, reason, expiresAt } = req.body;
      const ban = await chatService.banUser(
        streamId,
        userId,
        req.userId!,
        reason,
        expiresAt,
      );
      sendSuccess(res, ban, 201);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /streams/:id/chat/ban/:userId
router.delete(
  "/ban/:userId",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await chatService.unbanUser(
        req.params.id as string,
        req.params.userId as string,
      );
      sendSuccess(res, null);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /streams/:id/chat/:messageId
router.delete(
  "/:messageId",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await chatService.deleteMessage(req.params.messageId as string);
      sendSuccess(res, null);
    } catch (err) {
      next(err);
    }
  },
);

export { router as chatRestRoutes };
