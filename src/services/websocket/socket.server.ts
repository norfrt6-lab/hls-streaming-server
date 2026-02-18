import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { config } from "../../config";
import { logger } from "../../common/utils/logger";
import { socketAuthMiddleware } from "./socket.middleware";
import { setupChatNamespace } from "../../modules/chat/chat.gateway";
import { setupStreamsNamespace } from "./streams.namespace";
import { setupDashboardNamespace } from "./dashboard.namespace";
import { websocketConnectionsGauge } from "../metrics/metrics.service";

let io: Server;

function trackNamespaceConnections(nsp: ReturnType<Server["of"]>, name: string) {
  nsp.on("connection", (socket) => {
    websocketConnectionsGauge.inc({ namespace: name });
    socket.on("disconnect", () => {
      websocketConnectionsGauge.dec({ namespace: name });
    });
  });
}

export function getIO(): Server {
  return io;
}

export function setupSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // /streams namespace — public (no auth required)
  const streamsNsp = io.of("/streams");
  setupStreamsNamespace(streamsNsp);
  trackNamespaceConnections(streamsNsp, "streams");

  // /chat namespace — auth required
  const chatNsp = io.of("/chat");
  chatNsp.use(socketAuthMiddleware);
  setupChatNamespace(chatNsp);
  trackNamespaceConnections(chatNsp, "chat");

  // /dashboard namespace — auth required
  const dashboardNsp = io.of("/dashboard");
  dashboardNsp.use(socketAuthMiddleware);
  setupDashboardNamespace(dashboardNsp);
  trackNamespaceConnections(dashboardNsp, "dashboard");

  logger.info("Socket.IO server initialized with /streams, /chat, /dashboard namespaces");

  return io;
}
