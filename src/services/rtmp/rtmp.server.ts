import NodeMediaServer from "node-media-server";
import { config } from "../../config";
import { logger } from "../../common/utils/logger";
import { validateStreamKey } from "./rtmp.auth";
import { onStreamPublish, onStreamUnpublish } from "./rtmp.events";

let nms: NodeMediaServer;

// Map RTMP session IDs to stream IDs for cleanup
const sessionStreamMap = new Map<string, string>();

// Track streams that were force-stopped so donePublish doesn't double-process
const forceStoppedStreams = new Set<string>();

export function isForceStoppedStream(streamId: string): boolean {
  return forceStoppedStreams.has(streamId);
}

export function clearForceStoppedFlag(streamId: string) {
  forceStoppedStreams.delete(streamId);
}

export function setupRtmpServer() {
  const nmsConfig = {
    rtmp: {
      port: config.rtmpPort,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: 8888, // Internal HTTP-FLV port for transcoder to read streams
      allow_origin: "*",
    },
  };

  nms = new NodeMediaServer(nmsConfig);

  nms.on("prePublish", async (id: string, streamPath: string, _args: any) => {
    logger.info({ id, streamPath }, "RTMP prePublish");

    // streamPath format: /live/{stream_key}
    const parts = streamPath.split("/");
    const streamKey = parts[parts.length - 1];

    if (!streamKey) {
      logger.warn({ streamPath }, "No stream key in path");
      const session = nms.getSession(id);
      if (session) session.reject();
      return;
    }

    const stream = await validateStreamKey(streamKey);
    if (!stream) {
      logger.warn({ streamPath }, "Stream key validation failed");
      const session = nms.getSession(id);
      if (session) session.reject();
      return;
    }

    sessionStreamMap.set(id, stream.id);

    try {
      await onStreamPublish(stream.id, streamKey);
    } catch (err) {
      logger.error({ err, streamId: stream.id }, "Failed to handle stream publish");
    }
  });

  nms.on("donePublish", async (id: string, _streamPath: string) => {
    const streamId = sessionStreamMap.get(id);
    if (!streamId) return;

    sessionStreamMap.delete(id);

    try {
      await onStreamUnpublish(streamId);
    } catch (err) {
      logger.error({ err, streamId }, "Failed to handle stream unpublish");
    }
  });

  nms.run();
  logger.info(`RTMP server listening on port ${config.rtmpPort}`);
}

export function disconnectRtmpSession(streamId: string) {
  // Mark as force-stopped so donePublish won't double-process
  forceStoppedStreams.add(streamId);

  // Auto-clear the flag after 30 seconds to prevent leaks
  setTimeout(() => forceStoppedStreams.delete(streamId), 30000);

  for (const [sessionId, sId] of sessionStreamMap.entries()) {
    if (sId === streamId) {
      const session = nms.getSession(sessionId);
      if (session) {
        try {
          session.reject();
          logger.info({ streamId, sessionId }, "RTMP session disconnected");
        } catch (err) {
          logger.error({ streamId, sessionId, err }, "Failed to reject RTMP session");
        }
      }
      sessionStreamMap.delete(sessionId);
      return;
    }
  }
  logger.warn({ streamId }, "No active RTMP session found for stream");
}
