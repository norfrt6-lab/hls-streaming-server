import * as chatRepo from "./chat.repository";
import { AppError } from "../../common/utils/errors";

export async function getMessages(streamId: string, params: { page: number; limit: number }) {
  const session = await chatRepo.getActiveSession(streamId);
  if (!session) {
    return { messages: [], total: 0 };
  }
  return chatRepo.findMessages(session.id, params);
}

export async function sendMessage(streamId: string, userId: string, content: string) {
  // Check if user is banned
  const ban = await chatRepo.findBan(streamId, userId);
  if (ban) {
    if (!ban.expiresAt || ban.expiresAt > new Date()) {
      throw AppError.forbidden("You are banned from this chat");
    }
    // Ban expired, remove it
    await chatRepo.removeBan(streamId, userId);
  }

  const session = await chatRepo.getActiveSession(streamId);
  if (!session) throw AppError.badRequest("Stream is not live");

  return chatRepo.createMessage({
    sessionId: session.id,
    userId,
    content: content.trim(),
  });
}

export async function deleteMessage(messageId: string) {
  return chatRepo.deleteMessage(messageId);
}

export async function banUser(
  streamId: string,
  userId: string,
  bannedBy: string,
  reason?: string,
  expiresAt?: string,
) {
  const existing = await chatRepo.findBan(streamId, userId);
  if (existing) throw AppError.conflict("User is already banned");

  return chatRepo.createBan({
    streamId,
    userId,
    bannedBy,
    reason,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });
}

export async function unbanUser(streamId: string, userId: string) {
  try {
    await chatRepo.removeBan(streamId, userId);
  } catch {
    throw AppError.notFound("Ban not found");
  }
}
