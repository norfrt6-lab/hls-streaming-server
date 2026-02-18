import path from "path";

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3000", 10),
  rtmpPort: parseInt(process.env.RTMP_PORT ?? "1935", 10),

  database: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/hls_streaming?schema=public",
  },

  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "24h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },

  ffmpeg: {
    path: process.env.FFMPEG_PATH ?? "ffmpeg",
  },

  media: {
    root: path.resolve(process.env.MEDIA_ROOT ?? "./media"),
    hlsSegmentDuration: parseInt(process.env.HLS_SEGMENT_DURATION ?? "6", 10),
    hlsPlaylistSize: parseInt(process.env.HLS_PLAYLIST_SIZE ?? "10", 10),
  },

  thumbnails: {
    interval: parseInt(process.env.THUMBNAIL_INTERVAL ?? "30", 10),
  },

  limits: {
    maxStreams: parseInt(process.env.MAX_STREAMS ?? "10", 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? "*",
  },
} as const;
