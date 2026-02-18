import client from "prom-client";

// Collect default Node.js metrics
client.collectDefaultMetrics();

// Custom metrics
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

export const activeStreamsGauge = new client.Gauge({
  name: "active_streams",
  help: "Number of active streams",
});

export const totalViewersGauge = new client.Gauge({
  name: "total_viewers",
  help: "Total number of viewers across all streams",
});

export const activeTranscodersGauge = new client.Gauge({
  name: "active_transcoders",
  help: "Number of active FFmpeg transcoding processes",
});

export const chatMessagesTotal = new client.Counter({
  name: "chat_messages_total",
  help: "Total chat messages sent",
});

export const websocketConnectionsGauge = new client.Gauge({
  name: "websocket_connections",
  help: "Number of active WebSocket connections",
  labelNames: ["namespace"],
});

export { client as promClient };
