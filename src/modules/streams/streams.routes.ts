import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  getKeyHandler,
  regenerateKeyHandler,
} from "./streams.controller";
import { chatRestRoutes } from "../chat/chat.routes";

const router = Router();

// Public
router.get("/", listHandler);
router.get("/:id", getHandler);

// Authenticated
router.post("/", authenticate, authorize("admin", "streamer"), createHandler);
router.patch("/:id", authenticate, updateHandler);
router.delete("/:id", authenticate, deleteHandler);
router.get("/:id/key", authenticate, getKeyHandler);
router.post("/:id/key", authenticate, regenerateKeyHandler);

// Chat sub-routes: /streams/:id/chat
router.use("/:id/chat", chatRestRoutes);

export { router as streamsRoutes };
