import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";

const publicSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function findMany(params: {
  page: number;
  limit: number;
  role?: string;
  search?: string;
}) {
  const where: Prisma.UserWhereInput = {};

  if (params.role) {
    where.role = params.role as any;
  }

  if (params.search) {
    where.OR = [
      { username: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { displayName: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicSelect,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: publicSelect,
  });
}

export async function update(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id },
    data,
    select: publicSelect,
  });
}

export async function remove(id: string) {
  return prisma.user.delete({ where: { id } });
}
