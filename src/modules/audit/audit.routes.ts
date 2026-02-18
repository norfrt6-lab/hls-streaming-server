import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { listHandler } from "./audit.controller";

const router = Router();

router.get("/", authenticate, authorize("admin"), listHandler);

export { router as auditRoutes };
