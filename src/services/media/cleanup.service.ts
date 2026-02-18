import fs from "fs";
import path from "path";
import { config } from "../../config";
import { prisma } from "../../config/database";
import { logger } from "../../common/utils/logger";

let cleanupInterval: NodeJS.Timeout | null = null;

async function cleanupOfflineStreamMedia() {
  const liveDir = path.join(config.media.root, "live");

  if (!fs.existsSync(liveDir)) return;

  const streamDirs = fs.readdirSync(liveDir);
  if (streamDirs.length === 0) return;

  const cutoff = new Date(Date.now() - config.cleanup.intervalHours * 60 * 60 * 1000);

  for (const streamId of streamDirs) {
    try {
      const stream = await prisma.stream.findUnique({
        where: { id: streamId },
        select: { status: true, endedAt: true },
      });

      // Delete if: stream doesn't exist in DB, or stream is offline and ended before cutoff
      const shouldDelete =
        !stream ||
        (stream.status === "offline" && stream.endedAt && stream.endedAt < cutoff);

      if (shouldDelete) {
        const dirPath = path.join(liveDir, streamId);
        fs.rmSync(dirPath, { recursive: true, force: true });
        logger.info({ streamId }, "Cleaned up offline stream media directory");
      }
    } catch (err) {
      logger.error({ err, streamId }, "Failed to clean up stream media");
    }
  }
}

export function startMediaCleanup() {
  // Run cleanup every hour
  const intervalMs = config.cleanup.intervalHours * 60 * 60 * 1000;
  cleanupInterval = setInterval(() => {
    cleanupOfflineStreamMedia().catch((err) => {
      logger.error({ err }, "Media cleanup failed");
    });
  }, intervalMs);

  logger.info({ intervalHours: config.cleanup.intervalHours }, "Media cleanup scheduler started");
}

export function stopMediaCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info("Media cleanup scheduler stopped");
  }
}
