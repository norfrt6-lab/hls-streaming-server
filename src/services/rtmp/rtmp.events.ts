import { prisma } from "../../config/database";
import { logger } from "../../common/utils/logger";
import { getIO } from "../websocket/socket.server";
import {
  emitStreamLive,
  emitStreamOffline,
} from "../websocket/streams.namespace";
import { startTranscoding, stopTranscoding } from "../transcoding/transcoder";
import {
  startThumbnailCapture,
  stopThumbnailCapture,
} from "../../modules/thumbnails/thumbnails.service";
import { config } from "../../config";
import path from "path";
import fs from "fs";

export async function onStreamPublish(streamId: string, streamKey: string) {
  logger.info({ streamId }, "Stream published");

  // Update stream status + create session atomically
  const [stream] = await prisma.$transaction([
    prisma.stream.update({
      where: { id: streamId },
      data: { status: "live", startedAt: new Date() },
      include: { user: { select: { username: true, displayName: true } } },
    }),
    prisma.streamSession.create({
      data: { streamId, status: "live" },
    }),
  ]);

  // Ensure media directory exists
  const mediaDir = path.join(config.media.root, "live", streamId);
  fs.mkdirSync(mediaDir, { recursive: true });

  // Start FFmpeg transcoding
  startTranscoding(streamId, streamKey);

  // Start thumbnail capture
  startThumbnailCapture(streamId);

  // Notify viewers via WebSocket
  const io = getIO();
  if (io) {
    const streamsNsp = io.of("/streams");
    await emitStreamLive(streamsNsp, {
      streamId,
      title: stream.title,
      streamer: stream.user?.displayName ?? stream.user?.username ?? "Unknown",
      thumbnail: stream.thumbnailUrl,
    });
  }
}

export async function onStreamUnpublish(streamId: string) {
  logger.info({ streamId }, "Stream unpublished");

  // Stop transcoding and thumbnails
  stopTranscoding(streamId);
  stopThumbnailCapture(streamId);

  // Update stream status + end session atomically
  await prisma.$transaction(async (tx) => {
    await tx.stream.update({
      where: { id: streamId },
      data: { status: "offline", endedAt: new Date() },
    });

    const session = await tx.streamSession.findFirst({
      where: { streamId, status: "live" },
      orderBy: { startedAt: "desc" },
    });

    if (session) {
      const duration = Math.floor(
        (Date.now() - session.startedAt.getTime()) / 1000,
      );
      await tx.streamSession.update({
        where: { id: session.id },
        data: {
          status: "ended",
          endedAt: new Date(),
          durationSeconds: duration,
        },
      });
    }
  });

  // Notify viewers
  const io = getIO();
  if (io) {
    const streamsNsp = io.of("/streams");
    await emitStreamOffline(streamsNsp, streamId);
  }
}
