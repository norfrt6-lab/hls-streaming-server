import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
  summaryHandler,
  viewersHandler,
  sessionsHandler,
  dashboardHandler,
} from "./analytics.controller";

const router = Router();

router.use(authenticate);

router.get("/streams/:streamId", summaryHandler);
router.get("/streams/:streamId/viewers", viewersHandler);
router.get("/streams/:streamId/sessions", sessionsHandler);
router.get("/dashboard", authorize("admin"), dashboardHandler);

export { router as analyticsRoutes };
