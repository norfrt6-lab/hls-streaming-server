import { PrismaClient } from "@prisma/client";
import { logger } from "../common/utils/logger";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("error", (e) => {
  logger.error({ err: e }, "Prisma error");
});

prisma.$on("warn", (e) => {
  logger.warn({ err: e }, "Prisma warning");
});

export { prisma };
