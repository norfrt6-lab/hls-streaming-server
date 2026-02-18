import * as usersRepo from "./users.repository";
import * as auditService from "../audit/audit.service";
import { AppError } from "../../common/utils/errors";
import type { UpdateUserInput, UpdateRoleInput } from "./users.validator";

export async function listUsers(params: {
  page: number;
  limit: number;
  role?: string;
  search?: string;
}) {
  return usersRepo.findMany(params);
}

export async function getUser(id: string) {
  const user = await usersRepo.findById(id);
  if (!user) throw AppError.notFound("User not found");
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await usersRepo.findById(id);
  if (!user) throw AppError.notFound("User not found");
  return usersRepo.update(id, input);
}

export async function deleteUser(id: string, adminId?: string) {
  const user = await usersRepo.findById(id);
  if (!user) throw AppError.notFound("User not found");
  await usersRepo.remove(id);
  if (adminId) {
    await auditService.log(adminId, "USER_DELETED", "user", id, {
      username: user.username,
    });
  }
}

export async function updateRole(id: string, input: UpdateRoleInput, adminId?: string) {
  const user = await usersRepo.findById(id);
  if (!user) throw AppError.notFound("User not found");
  const updated = await usersRepo.update(id, { role: input.role });
  if (adminId) {
    await auditService.log(adminId, "ROLE_CHANGED", "user", id, {
      username: user.username,
      oldRole: user.role,
      newRole: input.role,
    });
  }
  return updated;
}
