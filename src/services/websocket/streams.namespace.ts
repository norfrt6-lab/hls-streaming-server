import type { Namespace, Socket } from "socket.io";
import { redis } from "../../config/redis";
import { logger } from "../../common/utils/logger";

// Track viewer counts in Redis
const VIEWERS_KEY = (streamId: string) => `viewers:${streamId}`;
const PEAK_KEY = (streamId: string) => `viewers:peak:${streamId}`;

async function decrementViewers(streamsNsp: Namespace, streamId: string) {
  const count = await redis.decr(VIEWERS_KEY(streamId));
  const safeCount = Math.max(0, count);
  if (count < 0) await redis.set(VIEWERS_KEY(streamId), 0);

  const peak = parseInt((await redis.get(PEAK_KEY(streamId))) ?? "0", 10);

  streamsNsp.to(`stream:${streamId}`).emit("stream:viewers", {
    streamId,
    count: safeCount,
    peak,
  });
}

export function setupStreamsNamespace(streamsNsp: Namespace) {
  streamsNsp.on("connection", (socket: Socket) => {
    // Track which streams this socket is viewing
    const joinedStreams = new Set<string>();

    socket.on("stream:join", async ({ streamId }: { streamId: string }) => {
      socket.join(`stream:${streamId}`);
      joinedStreams.add(streamId);

      // Increment viewer count
      const count = await redis.incr(VIEWERS_KEY(streamId));
      const peak = parseInt((await redis.get(PEAK_KEY(streamId))) ?? "0", 10);
      if (count > peak) {
        await redis.set(PEAK_KEY(streamId), count);
      }

      // Broadcast updated viewer count
      streamsNsp.to(`stream:${streamId}`).emit("stream:viewers", {
        streamId,
        count,
        peak: Math.max(count, peak),
      });
    });

    socket.on("stream:leave", async ({ streamId }: { streamId: string }) => {
      socket.leave(`stream:${streamId}`);
      joinedStreams.delete(streamId);
      await decrementViewers(streamsNsp, streamId);
    });

    socket.on("disconnect", async () => {
      // Decrement viewer count for all streams this socket was watching
      for (const streamId of joinedStreams) {
        await decrementViewers(streamsNsp, streamId);
      }
      joinedStreams.clear();
      logger.debug(
        { socketId: socket.id },
        "Viewer disconnected from streams namespace",
      );
    });
  });
}

export async function emitStreamLive(
  streamsNsp: Namespace,
  data: {
    streamId: string;
    title: string;
    streamer: string;
    thumbnail: string | null;
  },
) {
  // Reset viewer counts
  await redis.set(VIEWERS_KEY(data.streamId), 0);
  await redis.set(PEAK_KEY(data.streamId), 0);
  streamsNsp.emit("stream:live", data);
}

export async function emitStreamOffline(
  streamsNsp: Namespace,
  streamId: string,
) {
  await redis.del(VIEWERS_KEY(streamId));
  await redis.del(PEAK_KEY(streamId));
  streamsNsp.emit("stream:offline", { streamId });
}
