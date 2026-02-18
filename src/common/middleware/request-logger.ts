import pinoHttp from "pino-http";
import type { IncomingMessage } from "http";
import { logger } from "../utils/logger";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => (req as unknown as Express.Request).correlationId,
  customProps: (req: IncomingMessage) => ({
    correlationId: (req as unknown as Express.Request).correlationId,
  }),
});
