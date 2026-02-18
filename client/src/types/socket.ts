export interface StreamJoinPayload {
  streamId: string;
}

export interface StreamLeavePayload {
  streamId: string;
}

export interface StreamLivePayload {
  streamId: string;
  title: string;
  streamer: string;
  thumbnail: string | null;
}

export interface StreamOfflinePayload {
  streamId: string;
}

export interface StreamViewersPayload {
  streamId: string;
  count: number;
  peak: number;
}

export interface StreamHealthPayload {
  streamId: string;
  bitrate: number;
  fps: number;
  droppedFrames: number;
}

export interface ChatJoinPayload {
  streamId: string;
}

export interface ChatMessagePayload {
  streamId: string;
  content: string;
}

export interface ChatTypingPayload {
  streamId: string;
}

export interface ChatMessageReceived {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  content: string;
  timestamp: string;
}

export interface ChatDeletedPayload {
  messageId: string;
}

export interface ChatSystemPayload {
  streamId: string;
  message: string;
}

export interface ChatErrorPayload {
  code: string;
  message: string;
  retryAfter?: number;
}

export interface ChatHistoryPayload {
  messages: ChatMessageReceived[];
}

export interface DashboardMetricsPayload {
  cpu: number;
  memory: number;
  activeStreams: number;
  totalViewers: number;
  bandwidth: number;
  uptime: number;
}

export interface DashboardStreamPayload {
  streamId: string;
  viewers: number;
  bitrate: number;
  fps: number;
  duration: number;
  health: "good" | "warning" | "critical";
}

// Saga action types
export const SOCKET_CONNECT = "socket/connect" as const;
export const SOCKET_DISCONNECT = "socket/disconnect" as const;
export const SOCKET_JOIN_STREAM = "socket/joinStream" as const;
export const SOCKET_LEAVE_STREAM = "socket/leaveStream" as const;
export const SOCKET_JOIN_CHAT = "socket/joinChat" as const;
export const SOCKET_LEAVE_CHAT = "socket/leaveChat" as const;
export const SOCKET_SEND_CHAT_MESSAGE = "socket/sendChatMessage" as const;
export const SOCKET_SEND_TYPING = "socket/sendTyping" as const;
