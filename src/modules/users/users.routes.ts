import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import {
  listHandler,
  getHandler,
  updateHandler,
  deleteHandler,
  updateRoleHandler,
} from "./users.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin"), listHandler);
router.get("/:id", getHandler);
router.patch("/:id", updateHandler);
router.delete("/:id", authorize("admin"), deleteHandler);
router.patch("/:id/role", authorize("admin"), updateRoleHandler);

export { router as usersRoutes };
