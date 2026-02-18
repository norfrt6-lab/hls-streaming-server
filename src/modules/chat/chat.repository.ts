import { prisma } from "../../config/database";

export async function findMessages(sessionId: string, params: { page: number; limit: number }) {
  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { sessionId, isDeleted: false },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.chatMessage.count({ where: { sessionId, isDeleted: false } }),
  ]);

  return { messages: messages.reverse(), total };
}

export async function createMessage(data: { sessionId: string; userId: string; content: string }) {
  return prisma.chatMessage.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function deleteMessage(messageId: string) {
  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true },
  });
}

export async function findBan(streamId: string, userId: string) {
  return prisma.userBan.findUnique({
    where: { streamId_userId: { streamId, userId } },
  });
}

export async function createBan(data: {
  streamId: string;
  userId: string;
  bannedBy: string;
  reason?: string;
  expiresAt?: Date;
}) {
  return prisma.userBan.create({
    data,
    include: {
      user: { select: { id: true, username: true, displayName: true } },
    },
  });
}

export async function removeBan(streamId: string, userId: string) {
  return prisma.userBan.delete({
    where: { streamId_userId: { streamId, userId } },
  });
}

export async function getActiveSession(streamId: string) {
  return prisma.streamSession.findFirst({
    where: { streamId, status: "live" },
    orderBy: { startedAt: "desc" },
  });
}

export async function findAllBans(params: { page: number; limit: number; search?: string }) {
  const where: any = {};

  if (params.search) {
    where.OR = [
      { user: { username: { contains: params.search, mode: "insensitive" } } },
      { stream: { title: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  const [bans, total] = await Promise.all([
    prisma.userBan.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, displayName: true } },
        issuer: { select: { id: true, username: true, displayName: true } },
        stream: { select: { id: true, title: true } },
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.userBan.count({ where }),
  ]);

  return { bans, total };
}
