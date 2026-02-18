import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { config } from "../../config";
import { logger } from "../../common/utils/logger";
import { prisma } from "../../config/database";

const activeIntervals = new Map<string, NodeJS.Timeout>();

function captureThumbnail(streamId: string) {
  const thumbDir = path.join(config.media.root, "thumbnails", streamId);
  fs.mkdirSync(thumbDir, { recursive: true });

  const outputPath = path.join(thumbDir, "latest.jpg");
  const hlsInput = path.join(config.media.root, "live", streamId, "0", "playlist.m3u8");

  // Check if playlist exists before attempting capture
  if (!fs.existsSync(hlsInput)) return;

  const args = [
    "-y",
    "-i", hlsInput,
    "-vframes", "1",
    "-q:v", "5",
    "-vf", "scale=640:-1",
    outputPath,
  ];

  const proc = spawn(config.ffmpeg.path, args);

  proc.on("exit", async (code) => {
    if (code === 0) {
      // Update stream thumbnail URL
      try {
        await prisma.stream.update({
          where: { id: streamId },
          data: { thumbnailUrl: `/media/thumbnails/${streamId}/latest.jpg` },
        });
      } catch {
        // Stream may have ended
      }
    }
  });

  proc.on("error", (err) => {
    logger.debug({ err, streamId }, "Thumbnail capture failed");
  });
}

export function startThumbnailCapture(streamId: string) {
  // Initial capture after a delay (wait for HLS segments)
  setTimeout(() => captureThumbnail(streamId), 15000);

  // Periodic capture
  const interval = setInterval(
    () => captureThumbnail(streamId),
    config.thumbnails.interval * 1000,
  );
  activeIntervals.set(streamId, interval);

  logger.info({ streamId, interval: config.thumbnails.interval }, "Thumbnail capture started");
}

export function stopThumbnailCapture(streamId: string) {
  const interval = activeIntervals.get(streamId);
  if (interval) {
    clearInterval(interval);
    activeIntervals.delete(streamId);
    logger.info({ streamId }, "Thumbnail capture stopped");
  }
}
