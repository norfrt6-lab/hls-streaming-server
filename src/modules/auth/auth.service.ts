import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { AppError } from "../../common/utils/errors";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../../common/utils/crypto";
import type { LoginInput, RegisterInput } from "./auth.validator";

const REFRESH_TOKEN_PREFIX = "refresh:";
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function userToPublic(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export async function register(input: RegisterInput) {
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) throw AppError.conflict("Email already registered");

  const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
  if (existingUsername) throw AppError.conflict("Username already taken");

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashed,
      role: "viewer",
    },
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await redis.set(`${REFRESH_TOKEN_PREFIX}${refreshToken}`, user.id, "EX", REFRESH_TTL);

  return { user: userToPublic(user), accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw AppError.unauthorized("Invalid email or password");
  if (!user.isActive) throw AppError.forbidden("Account is deactivated");

  const valid = await verifyPassword(input.password, user.password);
  if (!valid) throw AppError.unauthorized("Invalid email or password");

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await redis.set(`${REFRESH_TOKEN_PREFIX}${refreshToken}`, user.id, "EX", REFRESH_TTL);

  return { user: userToPublic(user), accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  const stored = await redis.get(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
  if (!stored) throw AppError.unauthorized("Invalid or expired refresh token");

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) throw AppError.unauthorized("User not found or deactivated");

  // Rotate refresh token
  await redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);

  const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id });

  await redis.set(`${REFRESH_TOKEN_PREFIX}${newRefreshToken}`, user.id, "EX", REFRESH_TTL);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound("User not found");
  return userToPublic(user);
}
