import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";

const streamInclude = {
  user: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
};

export async function findMany(params: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  userId?: string;
}) {
  const where: Prisma.StreamWhereInput = {};

  if (params.status) {
    where.status = params.status as any;
  }

  if (params.userId) {
    where.userId = params.userId;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { category: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [streams, total] = await Promise.all([
    prisma.stream.findMany({
      where,
      include: streamInclude,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.stream.count({ where }),
  ]);

  return { streams, total };
}

export async function findById(id: string) {
  return prisma.stream.findUnique({
    where: { id },
    include: streamInclude,
  });
}

export async function findByStreamKey(hashedKey: string) {
  return prisma.stream.findUnique({
    where: { streamKey: hashedKey },
    include: { user: { select: { id: true, username: true, role: true } } },
  });
}

export async function create(data: Prisma.StreamCreateInput) {
  return prisma.stream.create({
    data,
    include: streamInclude,
  });
}

export async function update(id: string, data: Prisma.StreamUpdateInput) {
  return prisma.stream.update({
    where: { id },
    data,
    include: streamInclude,
  });
}

export async function remove(id: string) {
  return prisma.stream.delete({ where: { id } });
}
