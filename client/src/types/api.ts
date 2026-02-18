export type UserRole = "admin" | "streamer" | "viewer";
export type StreamStatus = "offline" | "live" | "error";
export type SessionStatus = "live" | "ended" | "error";
export type RecordingStatus = "processing" | "ready" | "error";
export type ViewerEventType = "join" | "leave" | "quality_change";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stream {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string | null;
  streamKey?: string;
  status: StreamStatus;
  isRecording: boolean;
  thumbnailUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  viewerCount?: number;
}

export interface StreamSession {
  id: string;
  streamId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  peakViewers: number;
  totalUniqueViewers: number;
  avgBitrate: number | null;
  recordingPath: string | null;
  recordingSize: number | null;
  status: SessionStatus;
}

export interface ViewerEvent {
  id: string;
  sessionId: string;
  userId: string | null;
  eventType: ViewerEventType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  user?: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
}

export interface UserBan {
  id: string;
  streamId: string;
  userId: string;
  bannedBy: string;
  reason: string | null;
  expiresAt: string | null;
  createdAt: string;
  user?: Pick<User, "id" | "username" | "displayName">;
}

export interface BanWithDetails extends UserBan {
  issuer?: Pick<User, "id" | "username" | "displayName">;
  stream?: Pick<Stream, "id" | "title">;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: Pick<User, "id" | "username" | "displayName">;
}

export interface Recording {
  id: string;
  sessionId: string;
  streamId: string;
  title: string;
  filePath: string;
  hlsPath: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  fileSize: number;
  status: RecordingStatus;
  createdAt: string;
  stream?: Pick<Stream, "id" | "title" | "user">;
}

export interface DashboardMetrics {
  cpu: number;
  memory: number;
  activeStreams: number;
  totalViewers: number;
  bandwidth: number;
  uptime: number;
}

export interface StreamHealth {
  streamId: string;
  bitrate: number;
  fps: number;
  droppedFrames: number;
}

export interface StreamAnalyticsSummary {
  totalSessions: number;
  totalWatchHours: number;
  avgViewers: number;
  peakViewers: number;
}

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  services: {
    database: { status: "up" | "down"; latency: string };
    redis: { status: "up" | "down"; latency: string };
    rtmp: { status: "up" | "down"; connections: number };
    ffmpeg: { status: "up" | "down"; processes: number };
  };
  system: {
    cpu: string;
    memory: string;
    disk: string;
  };
}

// API response wrappers
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface StreamCreateRequest {
  title: string;
  description?: string;
  category?: string;
}

export interface StreamUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
}

export interface BanUserRequest {
  userId: string;
  reason?: string;
  expiresAt?: string;
}
