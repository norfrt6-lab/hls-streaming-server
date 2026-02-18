import { eventChannel, type EventChannel } from "redux-saga";
import { fork, put, take, takeLatest, select } from "redux-saga/effects";
import { io, type Socket } from "socket.io-client";
import { SOCKET_URL, SOCKET_NAMESPACES } from "@/lib/constants";
import {
  setConnected,
  updateViewerCount,
  updateStreamHealth,
  updateDashboardMetrics,
  updateDashboardStream,
  resetSocket,
} from "@/store/slices/socket-slice";
import { baseApi } from "@/store/api/base-api";
import {
  setHistory,
  addMessage,
  removeMessage,
  initRoom,
  setRateLimited,
} from "@/store/slices/chat-slice";
import {
  SOCKET_CONNECT,
  SOCKET_DISCONNECT,
  SOCKET_JOIN_STREAM,
  SOCKET_LEAVE_STREAM,
  SOCKET_JOIN_CHAT,
  SOCKET_LEAVE_CHAT,
  SOCKET_SEND_CHAT_MESSAGE,
  SOCKET_SEND_TYPING,
  type StreamViewersPayload,
  type StreamHealthPayload,
  type StreamLivePayload,
  type StreamOfflinePayload,
  type DashboardMetricsPayload,
  type DashboardStreamPayload,
  type ChatMessageReceived,
  type ChatDeletedPayload,
  type ChatErrorPayload,
  type ChatHistoryPayload,
} from "@/types/socket";
import type { RootState } from "@/store";

type SocketEvent =
  | { type: "connect" }
  | { type: "disconnect" }
  | { type: "stream:live"; payload: StreamLivePayload }
  | { type: "stream:offline"; payload: StreamOfflinePayload }
  | { type: "stream:viewers"; payload: StreamViewersPayload }
  | { type: "stream:health"; payload: StreamHealthPayload }
  | { type: "chat:history"; payload: ChatHistoryPayload }
  | {
      type: "chat:message";
      payload: ChatMessageReceived & { streamId: string };
    }
  | { type: "chat:deleted"; payload: ChatDeletedPayload & { streamId: string } }
  | { type: "chat:error"; payload: ChatErrorPayload }
  | { type: "dashboard:metrics"; payload: DashboardMetricsPayload }
  | { type: "dashboard:stream"; payload: DashboardStreamPayload };

function createSocketChannel(socket: Socket): EventChannel<SocketEvent> {
  return eventChannel((emit) => {
    socket.on("connect", () => emit({ type: "connect" }));
    socket.on("disconnect", () => emit({ type: "disconnect" }));
    socket.on("connect_error", () => emit({ type: "disconnect" }));

    // Stream namespace events
    socket.on("stream:live", (payload: StreamLivePayload) =>
      emit({ type: "stream:live", payload }),
    );
    socket.on("stream:offline", (payload: StreamOfflinePayload) =>
      emit({ type: "stream:offline", payload }),
    );
    socket.on("stream:viewers", (payload: StreamViewersPayload) =>
      emit({ type: "stream:viewers", payload }),
    );
    socket.on("stream:health", (payload: StreamHealthPayload) =>
      emit({ type: "stream:health", payload }),
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("stream:live");
      socket.off("stream:offline");
      socket.off("stream:viewers");
      socket.off("stream:health");
    };
  });
}

function createChatChannel(socket: Socket): EventChannel<SocketEvent> {
  return eventChannel((emit) => {
    socket.on("connect", () => emit({ type: "connect" }));
    socket.on("disconnect", () => emit({ type: "disconnect" }));
    socket.on("connect_error", () => emit({ type: "disconnect" }));
    socket.on("chat:history", (payload: ChatHistoryPayload) =>
      emit({ type: "chat:history", payload }),
    );
    socket.on("chat:message", (payload: ChatMessageReceived & { streamId: string }) =>
      emit({ type: "chat:message", payload }),
    );
    socket.on("chat:deleted", (payload: ChatDeletedPayload & { streamId: string }) =>
      emit({ type: "chat:deleted", payload }),
    );
    socket.on("chat:error", (payload: ChatErrorPayload) => emit({ type: "chat:error", payload }));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("chat:history");
      socket.off("chat:message");
      socket.off("chat:deleted");
      socket.off("chat:error");
    };
  });
}

function createDashboardChannel(socket: Socket): EventChannel<SocketEvent> {
  return eventChannel((emit) => {
    socket.on("connect", () => emit({ type: "connect" }));
    socket.on("disconnect", () => emit({ type: "disconnect" }));
    socket.on("connect_error", () => emit({ type: "disconnect" }));
    socket.on("dashboard:metrics", (payload: DashboardMetricsPayload) =>
      emit({ type: "dashboard:metrics", payload }),
    );
    socket.on("dashboard:stream", (payload: DashboardStreamPayload) =>
      emit({ type: "dashboard:stream", payload }),
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("dashboard:metrics");
      socket.off("dashboard:stream");
    };
  });
}

const sockets: Record<string, Socket> = {};

function getOrCreateSocket(namespace: string, token?: string | null): Socket {
  if (sockets[namespace]?.connected) return sockets[namespace];

  const auth = token ? { token } : undefined;
  const socket = io(`${SOCKET_URL}${namespace}`, {
    auth,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  sockets[namespace] = socket;
  return socket;
}

function* handleStreamsSocket(): Generator {
  const socket = getOrCreateSocket(SOCKET_NAMESPACES.STREAMS);
  const channel = createSocketChannel(socket) as EventChannel<SocketEvent>;

  try {
    while (true) {
      const event = (yield take(channel)) as SocketEvent;
      switch (event.type) {
        case "connect":
          yield put(setConnected({ namespace: "streams", connected: true }));
          break;
        case "disconnect":
          yield put(setConnected({ namespace: "streams", connected: false }));
          break;
        case "stream:live":
          // Invalidate stream cache so pages refetch immediately
          yield put(
            baseApi.util.invalidateTags([
              { type: "Stream", id: event.payload.streamId },
              { type: "Stream", id: "LIST" },
              { type: "Stream", id: "LIVE" },
            ]),
          );
          break;
        case "stream:offline":
          // Invalidate stream cache so viewer page shows offline immediately
          yield put(
            baseApi.util.invalidateTags([
              { type: "Stream", id: event.payload.streamId },
              { type: "Stream", id: "LIST" },
              { type: "Stream", id: "LIVE" },
            ]),
          );
          break;
        case "stream:viewers":
          yield put(updateViewerCount(event.payload));
          break;
        case "stream:health":
          yield put(updateStreamHealth(event.payload));
          break;
      }
    }
  } finally {
    channel.close();
    socket.disconnect();
    delete sockets[SOCKET_NAMESPACES.STREAMS];
  }
}

function* handleChatSocket(): Generator {
  const token = ((yield select((s: RootState) => s.auth.accessToken)) as string) ?? undefined;
  const socket = getOrCreateSocket(SOCKET_NAMESPACES.CHAT, token);
  const channel = createChatChannel(socket) as EventChannel<SocketEvent>;

  try {
    while (true) {
      const event = (yield take(channel)) as SocketEvent;
      switch (event.type) {
        case "connect":
          yield put(setConnected({ namespace: "chat", connected: true }));
          break;
        case "disconnect":
          yield put(setConnected({ namespace: "chat", connected: false }));
          break;
        case "chat:history":
          yield put(
            setHistory({
              streamId: event.payload.streamId,
              messages: event.payload.messages,
            }),
          );
          break;
        case "chat:message":
          yield put(
            addMessage({
              streamId: event.payload.streamId,
              message: event.payload,
            }),
          );
          break;
        case "chat:deleted":
          yield put(
            removeMessage({
              streamId: event.payload.streamId,
              messageId: event.payload.messageId,
            }),
          );
          break;
        case "chat:error":
          if (event.payload.code === "RATE_LIMITED") {
            yield put(
              setRateLimited({
                limited: true,
                retryAfter: event.payload.retryAfter ?? 1,
              }),
            );
          }
          break;
      }
    }
  } finally {
    channel.close();
    socket.disconnect();
    delete sockets[SOCKET_NAMESPACES.CHAT];
  }
}

function* handleDashboardSocket(): Generator {
  const token = ((yield select((s: RootState) => s.auth.accessToken)) as string) ?? undefined;
  const socket = getOrCreateSocket(SOCKET_NAMESPACES.DASHBOARD, token);
  const channel = createDashboardChannel(socket) as EventChannel<SocketEvent>;

  try {
    while (true) {
      const event = (yield take(channel)) as SocketEvent;
      switch (event.type) {
        case "connect":
          yield put(setConnected({ namespace: "dashboard", connected: true }));
          break;
        case "disconnect":
          yield put(setConnected({ namespace: "dashboard", connected: false }));
          break;
        case "dashboard:metrics":
          yield put(updateDashboardMetrics(event.payload));
          break;
        case "dashboard:stream":
          yield put(updateDashboardStream(event.payload));
          break;
      }
    }
  } finally {
    channel.close();
    socket.disconnect();
    delete sockets[SOCKET_NAMESPACES.DASHBOARD];
  }
}

function* handleConnect(): Generator {
  yield fork(handleStreamsSocket);
  yield fork(handleChatSocket);
  yield fork(handleDashboardSocket);
}

function* handleDisconnect(): Generator {
  for (const key of Object.keys(sockets)) {
    sockets[key].disconnect();
    delete sockets[key];
  }
  yield put(resetSocket());
}

function* handleJoinStream(action: { type: string; payload: string }): Generator {
  const socket = sockets[SOCKET_NAMESPACES.STREAMS];
  if (socket?.connected) {
    socket.emit("stream:join", { streamId: action.payload });
  }
}

function* handleLeaveStream(action: { type: string; payload: string }): Generator {
  const socket = sockets[SOCKET_NAMESPACES.STREAMS];
  if (socket?.connected) {
    socket.emit("stream:leave", { streamId: action.payload });
  }
}

function* handleJoinChat(action: { type: string; payload: string }): Generator {
  yield put(initRoom(action.payload));
  const socket = sockets[SOCKET_NAMESPACES.CHAT];
  if (socket?.connected) {
    socket.emit("chat:join", { streamId: action.payload });
  }
}

function* handleLeaveChat(action: { type: string; payload: string }): Generator {
  const socket = sockets[SOCKET_NAMESPACES.CHAT];
  if (socket?.connected) {
    socket.emit("chat:leave", { streamId: action.payload });
  }
}

function* handleSendChatMessage(action: {
  type: string;
  payload: { streamId: string; content: string };
}): Generator {
  const socket = sockets[SOCKET_NAMESPACES.CHAT];
  if (socket?.connected) {
    socket.emit("chat:message", action.payload);
  }
}

function* handleSendTyping(action: { type: string; payload: string }): Generator {
  const socket = sockets[SOCKET_NAMESPACES.CHAT];
  if (socket?.connected) {
    socket.emit("chat:typing", { streamId: action.payload });
  }
}

export default function* socketSaga(): Generator {
  yield takeLatest(SOCKET_CONNECT, handleConnect);
  yield takeLatest(SOCKET_DISCONNECT, handleDisconnect);
  yield takeLatest(SOCKET_JOIN_STREAM, handleJoinStream);
  yield takeLatest(SOCKET_LEAVE_STREAM, handleLeaveStream);
  yield takeLatest(SOCKET_JOIN_CHAT, handleJoinChat);
  yield takeLatest(SOCKET_LEAVE_CHAT, handleLeaveChat);
  yield takeLatest(SOCKET_SEND_CHAT_MESSAGE, handleSendChatMessage);
  yield takeLatest(SOCKET_SEND_TYPING, handleSendTyping);
}
