import { hashStreamKey } from "../../common/utils/crypto";
import * as streamsRepo from "../../modules/streams/streams.repository";
import { logger } from "../../common/utils/logger";

export async function validateStreamKey(streamKey: string) {
  const hashed = hashStreamKey(streamKey);
  const stream = await streamsRepo.findByStreamKey(hashed);

  if (!stream) {
    logger.warn({ streamKey: streamKey.slice(0, 8) + "..." }, "Invalid stream key");
    return null;
  }

  if (!stream.user) {
    logger.warn({ streamId: stream.id }, "Stream has no associated user");
    return null;
  }

  return stream;
}
