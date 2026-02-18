import * as streamsRepo from "./streams.repository";
import { AppError } from "../../common/utils/errors";
import { generateStreamKey, hashStreamKey } from "../../common/utils/crypto";
import * as auditService from "../audit/audit.service";
import { stopTranscoding } from "../../services/transcoding/transcoder";
import { stopThumbnailCapture } from "../thumbnails/thumbnails.service";
import { getIO } from "../../services/websocket/socket.server";
import { emitStreamOffline } from "../../services/websocket/streams.namespace";
import { prisma } from "../../config/database";
import type { CreateStreamInput, UpdateStreamInput } from "./streams.validator";

function stripStreamKey(stream: any) {
  const { streamKey, ...rest } = stream;
  return rest;
}

export async function listStreams(params: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) {
  const { streams, total } = await streamsRepo.findMany(params);
  return { streams: streams.map(stripStreamKey), total };
}

export async function getStream(id: string) {
  const stream = await streamsRepo.findById(id);
  if (!stream) throw AppError.notFound("Stream not found");
  return stripStreamKey(stream);
}

export async function createStream(userId: string, input: CreateStreamInput) {
  const rawKey = generateStreamKey();
  const hashedKey = hashStreamKey(rawKey);

  const stream = await streamsRepo.create({
    ...input,
    streamKey: hashedKey,
    user: { connect: { id: userId } },
  });

  // Return the raw key only on creation
  return { ...stripStreamKey(stream), streamKey: rawKey };
}

export async function updateStream(
  id: string,
  userId: string,
  userRole: string,
  input: UpdateStreamInput,
) {
  const stream = await streamsRepo.findById(id);
  if (!stream) throw AppError.notFound("Stream not found");
  if (stream.userId !== userId && userRole !== "admin") {
    throw AppError.forbidden("You can only update your own streams");
  }

  const updated = await streamsRepo.update(id, input);
  return stripStreamKey(updated);
}

export async function deleteStream(
  id: string,
  userId: string,
  userRole: string,
) {
  const stream = await streamsRepo.findById(id);
  if (!stream) throw AppError.notFound("Stream not found");
  if (stream.userId !== userId && userRole !== "admin") {
    throw AppError.forbidden("You can only delete your own streams");
  }
  await streamsRepo.remove(id);
}

export async function getStreamKey(
  id: string,
  userId: string,
  userRole: string,
) {
  const stream = await streamsRepo.findById(id);
  if (!stream) throw AppError.notFound("Stream not found");
  if (stream.userId !== userId && userRole !== "admin") {
    throw AppError.forbidden("You can only view your own stream key");
  }
  // Can't reverse the hash — return a message
  // The raw key is only shown once at creation or regeneration
  return { streamKey: "****" };
}

export async function regenerateStreamKey(
  id: string,
  userId: string,
  userRole: string,
) {
  const stream = await streamsRepo.findById(id);
  if (!stream) throw AppError.notFound("Stream not found");
  if (stream.userId !== userId && userRole !== "admin") {
    throw AppError.forbidden("You can only regenerate your own stream key");
  }

  const rawKey = generateStreamKey();
  const hashedKey = hashStreamKey(rawKey);

  await streamsRepo.update(id, { streamKey: hashedKey });
  return { streamKey: rawKey };
}

export async function forceStopStream(id: string, adminId?: string) {
  const stream = await streamsRepo.findById(id);
  if (!stream) throw AppError.notFound("Stream not found");
  if (stream.status !== "live") throw AppError.badRequest("Stream is not live");

  // Stop transcoding and thumbnails
  stopTranscoding(id);
  stopThumbnailCapture(id);

  // Update stream status + end session atomically
  await prisma.$transaction(async (tx) => {
    await tx.stream.update({
      where: { id },
      data: { status: "offline", endedAt: new Date() },
    });

    const session = await tx.streamSession.findFirst({
      where: { streamId: id, status: "live" },
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
    await emitStreamOffline(streamsNsp, id);
  }

  if (adminId) {
    await auditService.log(adminId, "STREAM_STOPPED", "stream", id, {
      title: stream.title,
      streamer: stream.userId,
    });
  }

  return stripStreamKey(stream);
}
