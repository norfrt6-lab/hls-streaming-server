import type { Socket } from "socket.io";
import { verifyToken } from "../../common/utils/crypto";
import { prisma } from "../../config/database";
import { logger } from "../../common/utils/logger";

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, displayName: true, avatarUrl: true, role: true },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.data.userId = user.id;
    socket.data.username = user.username;
    socket.data.displayName = user.displayName;
    socket.data.avatarUrl = user.avatarUrl;
    socket.data.role = user.role;
    next();
  } catch (err) {
    logger.debug({ err }, "Socket auth failed");
    next(new Error("Invalid token"));
  }
}
