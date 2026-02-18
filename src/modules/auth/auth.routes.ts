import { Router } from "express";
import { authenticate } from "./auth.middleware";
import { authLimiter } from "../../common/middleware/rate-limiter";
import { validate } from "../../common/middleware/validate";
import { loginSchema, registerSchema, refreshSchema } from "./auth.validator";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
} from "./auth.controller";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), registerHandler);
router.post("/login", authLimiter, validate(loginSchema), loginHandler);
router.post("/refresh", validate(refreshSchema), refreshHandler);
router.post("/logout", authenticate, logoutHandler);
router.get("/me", authenticate, getMeHandler);

export { router as authRoutes };
