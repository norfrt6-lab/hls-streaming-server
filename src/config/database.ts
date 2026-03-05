import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../common/utils/logger";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("error", (e: Prisma.LogEvent) => {
  logger.error({ err: e }, "Prisma error");
});

prisma.$on("warn", (e: Prisma.LogEvent) => {
  logger.warn({ err: e }, "Prisma warning");
});

export { prisma };
