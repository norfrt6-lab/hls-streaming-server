import { Router } from "express";
import { authenticate } from "./auth.middleware";
import { authLimiter } from "../../common/middleware/rate-limiter";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
} from "./auth.controller";

const router = Router();

router.post("/register", authLimiter, registerHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", authenticate, logoutHandler);
router.get("/me", authenticate, getMeHandler);

export { router as authRoutes };
