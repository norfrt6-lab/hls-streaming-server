import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  DashboardMetricsPayload,
  DashboardStreamPayload,
  StreamHealthPayload,
  StreamViewersPayload,
} from "@/types/socket";

interface SocketState {
  connected: {
    streams: boolean;
    chat: boolean;
    dashboard: boolean;
  };
  viewerCounts: Record<string, { count: number; peak: number }>;
  streamHealth: Record<string, StreamHealthPayload>;
  dashboardMetrics: DashboardMetricsPayload | null;
  dashboardStreams: Record<string, DashboardStreamPayload>;
  metricsHistory: Array<DashboardMetricsPayload & { timestamp: number }>;
}

const initialState: SocketState = {
  connected: {
    streams: false,
    chat: false,
    dashboard: false,
  },
  viewerCounts: {},
  streamHealth: {},
  dashboardMetrics: null,
  dashboardStreams: {},
  metricsHistory: [],
};

const MAX_HISTORY = 60;

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected(
      state,
      action: PayloadAction<{ namespace: keyof SocketState["connected"]; connected: boolean }>,
    ) {
      state.connected[action.payload.namespace] = action.payload.connected;
    },
    updateViewerCount(state, action: PayloadAction<StreamViewersPayload>) {
      const { streamId, count, peak } = action.payload;
      state.viewerCounts[streamId] = { count, peak };
    },
    removeViewerCount(state, action: PayloadAction<string>) {
      delete state.viewerCounts[action.payload];
    },
    updateStreamHealth(state, action: PayloadAction<StreamHealthPayload>) {
      state.streamHealth[action.payload.streamId] = action.payload;
    },
    removeStreamHealth(state, action: PayloadAction<string>) {
      delete state.streamHealth[action.payload];
    },
    updateDashboardMetrics(state, action: PayloadAction<DashboardMetricsPayload>) {
      state.dashboardMetrics = action.payload;
      state.metricsHistory.push({
        ...action.payload,
        timestamp: Date.now(),
      });
      if (state.metricsHistory.length > MAX_HISTORY) {
        state.metricsHistory.shift();
      }
    },
    updateDashboardStream(state, action: PayloadAction<DashboardStreamPayload>) {
      state.dashboardStreams[action.payload.streamId] = action.payload;
    },
    removeDashboardStream(state, action: PayloadAction<string>) {
      delete state.dashboardStreams[action.payload];
    },
    resetSocket() {
      return initialState;
    },
  },
});

export const {
  setConnected,
  updateViewerCount,
  removeViewerCount,
  updateStreamHealth,
  removeStreamHealth,
  updateDashboardMetrics,
  updateDashboardStream,
  removeDashboardStream,
  resetSocket,
} = socketSlice.actions;

export const selectConnected = (state: { socket: SocketState }) => state.socket.connected;
export const selectViewerCount = (streamId: string) => (state: { socket: SocketState }) =>
  state.socket.viewerCounts[streamId] ?? { count: 0, peak: 0 };
export const selectStreamHealth = (streamId: string) => (state: { socket: SocketState }) =>
  state.socket.streamHealth[streamId] ?? null;
export const selectDashboardMetrics = (state: { socket: SocketState }) =>
  state.socket.dashboardMetrics;
export const selectDashboardStreams = (state: { socket: SocketState }) =>
  state.socket.dashboardStreams;
export const selectMetricsHistory = (state: { socket: SocketState }) => state.socket.metricsHistory;

export default socketSlice.reducer;
