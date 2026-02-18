import { z } from "zod";

export const updateUserSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "streamer", "viewer"]),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
