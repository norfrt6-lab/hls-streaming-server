import * as usersRepo from "./users.repository";
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

export async function deleteUser(id: string) {
  const user = await usersRepo.findById(id);
  if (!user) throw AppError.notFound("User not found");
  await usersRepo.remove(id);
}

export async function updateRole(id: string, input: UpdateRoleInput) {
  const user = await usersRepo.findById(id);
  if (!user) throw AppError.notFound("User not found");
  return usersRepo.update(id, { role: input.role });
}
