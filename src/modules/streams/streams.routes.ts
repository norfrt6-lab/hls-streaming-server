import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { validate } from "../../common/middleware/validate";
import { createStreamSchema, updateStreamSchema } from "./streams.validator";
import {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  getKeyHandler,
  regenerateKeyHandler,
  forceStopHandler,
} from "./streams.controller";
import { chatRestRoutes } from "../chat/chat.routes";

const router = Router();

// Public
router.get("/", listHandler);
router.get("/:id", getHandler);

// Authenticated
router.post(
  "/",
  authenticate,
  authorize("admin", "streamer"),
  validate(createStreamSchema),
  createHandler,
);
router.patch("/:id", authenticate, validate(updateStreamSchema), updateHandler);
router.delete("/:id", authenticate, deleteHandler);
router.get("/:id/key", authenticate, getKeyHandler);
router.post("/:id/key", authenticate, regenerateKeyHandler);

// Admin-only
router.post("/:id/stop", authenticate, authorize("admin"), forceStopHandler);

// Chat sub-routes: /streams/:id/chat
router.use("/:id/chat", chatRestRoutes);

export { router as streamsRoutes };
