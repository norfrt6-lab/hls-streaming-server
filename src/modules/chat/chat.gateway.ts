import type { Namespace, Socket } from "socket.io";
import * as chatService from "./chat.service";
import { logger } from "../../common/utils/logger";
import { chatMessagesTotal } from "../../services/metrics/metrics.service";

export function setupChatNamespace(chatNsp: Namespace) {
  chatNsp.on("connection", (socket: Socket) => {
    const userId = (socket.data as any).userId;
    const username = (socket.data as any).username;
    const displayName = (socket.data as any).displayName;
    const avatarUrl = (socket.data as any).avatarUrl;

    socket.on("chat:join", async ({ streamId }: { streamId: string }) => {
      socket.join(`chat:${streamId}`);
      logger.debug({ userId, streamId }, "User joined chat");

      // Send chat history
      try {
        const { messages } = await chatService.getMessages(streamId, { page: 1, limit: 50 });
        const formatted = messages.map((m: any) => ({
          id: m.id,
          userId: m.userId,
          username: m.user?.username ?? "unknown",
          displayName: m.user?.displayName ?? null,
          avatarUrl: m.user?.avatarUrl ?? null,
          content: m.content,
          timestamp: m.createdAt.toISOString(),
        }));
        socket.emit("chat:history", { streamId, messages: formatted });
      } catch (err) {
        logger.error({ err, streamId }, "Failed to send chat history");
      }
    });

    socket.on("chat:leave", ({ streamId }: { streamId: string }) => {
      socket.leave(`chat:${streamId}`);
    });

    socket.on(
      "chat:message",
      async ({ streamId, content }: { streamId: string; content: string }) => {
        if (!content?.trim()) return;

        try {
          const message = await chatService.sendMessage(streamId, userId, content);
          chatMessagesTotal.inc();
          const payload = {
            id: message.id,
            userId: message.userId,
            username: message.user?.username ?? username,
            displayName: message.user?.displayName ?? displayName,
            avatarUrl: message.user?.avatarUrl ?? avatarUrl,
            content: message.content,
            timestamp: message.createdAt.toISOString(),
            streamId,
          };
          chatNsp.to(`chat:${streamId}`).emit("chat:message", payload);
        } catch (err: any) {
          if (err.code === "FORBIDDEN") {
            socket.emit("chat:error", { code: "BANNED", message: err.message });
          } else if (err.code === "RATE_LIMITED") {
            socket.emit("chat:error", {
              code: "RATE_LIMITED",
              message: err.message,
              retryAfter: 1,
            });
          } else {
            socket.emit("chat:error", { code: "SEND_FAILED", message: "Failed to send message" });
          }
        }
      },
    );

    socket.on("chat:typing", ({ streamId }: { streamId: string }) => {
      socket.to(`chat:${streamId}`).emit("chat:typing", { username, streamId });
    });

    socket.on("disconnect", () => {
      logger.debug({ userId }, "User disconnected from chat");
    });
  });
}
