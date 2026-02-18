export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

export const SOCKET_NAMESPACES = {
  STREAMS: "/streams",
  CHAT: "/chat",
  DASHBOARD: "/dashboard",
} as const;

export const QUALITY_LABELS: Record<number, string> = {
  0: "1080p",
  1: "720p",
  2: "480p",
  3: "360p",
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  streamer: "Streamer",
  viewer: "Viewer",
};

export const STREAM_STATUS_LABELS: Record<string, string> = {
  live: "Live",
  offline: "Offline",
  error: "Error",
};

export const CATEGORIES = [
  "Gaming",
  "Music",
  "Education",
  "Technology",
  "Art",
  "Sports",
  "Talk Shows",
  "Cooking",
  "Travel",
  "Other",
] as const;

export const PAGINATION_DEFAULT = {
  PAGE: 1,
  LIMIT: 20,
} as const;

export const POLLING_INTERVALS = {
  STREAMS_LIST: 10_000,
  ANALYTICS: 30_000,
  HEALTH: 15_000,
} as const;
