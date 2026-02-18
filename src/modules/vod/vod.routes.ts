import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { listHandler, getHandler, deleteHandler, manifestHandler } from "./vod.controller";

const router = Router();

router.get("/", listHandler);
router.get("/:id", getHandler);
router.delete("/:id", authenticate, deleteHandler);
router.get("/:id/manifest", manifestHandler);

export { router as vodRoutes };
