import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";

const vodInclude = {
  stream: {
    select: {
      id: true,
      title: true,
      user: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  },
};

export async function findMany(params: { page: number; limit: number; search?: string }) {
  const where: Prisma.RecordingWhereInput = { status: "ready" };

  if (params.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }

  const [recordings, total] = await Promise.all([
    prisma.recording.findMany({
      where,
      include: vodInclude,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.recording.count({ where }),
  ]);

  // Convert BigInt to Number for JSON serialization
  const serialized = recordings.map((r) => ({
    ...r,
    fileSize: Number(r.fileSize),
  }));

  return { recordings: serialized, total };
}

export async function findById(id: string) {
  const recording = await prisma.recording.findUnique({
    where: { id },
    include: vodInclude,
  });

  if (!recording) return null;

  return { ...recording, fileSize: Number(recording.fileSize) };
}

export async function remove(id: string) {
  return prisma.recording.delete({ where: { id } });
}
