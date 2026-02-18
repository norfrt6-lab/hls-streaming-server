import NodeMediaServer from "node-media-server";
import { config } from "../../config";
import { logger } from "../../common/utils/logger";
import { validateStreamKey } from "./rtmp.auth";
import { onStreamPublish, onStreamUnpublish } from "./rtmp.events";

let nms: NodeMediaServer;

// Map RTMP session IDs to stream IDs for cleanup
const sessionStreamMap = new Map<string, string>();

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
      port: 0, // Disable NMS built-in HTTP (we use Express)
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
