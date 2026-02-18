import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware";
import { validate } from "../../common/middleware/validate";
import { updateUserSchema, updateRoleSchema } from "./users.validator";
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
router.patch("/:id", validate(updateUserSchema), updateHandler);
router.delete("/:id", authorize("admin"), deleteHandler);
router.patch(
  "/:id/role",
  authorize("admin"),
  validate(updateRoleSchema),
  updateRoleHandler,
);

export { router as usersRoutes };
