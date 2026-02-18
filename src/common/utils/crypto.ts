import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { config } from "../../config";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string | number,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn as string | number,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
}

export function generateStreamKey(): string {
  return uuidv4();
}

export function hashStreamKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
