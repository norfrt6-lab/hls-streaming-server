import { baseApi } from "./base-api";
import type {
  ApiResponse,
  DashboardMetrics,
  HealthCheck,
  PaginationParams,
  StreamAnalyticsSummary,
  StreamSession,
  ViewerEvent,
} from "@/types/api";
import { POLLING_INTERVALS } from "@/lib/constants";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStreamAnalytics: builder.query<
      ApiResponse<StreamAnalyticsSummary>,
      string
    >({
      query: (streamId) => `/analytics/streams/${streamId}`,
      providesTags: (_result, _error, id) => [{ type: "Analytics", id }],
    }),
    getViewerHistory: builder.query<
      ApiResponse<ViewerEvent[]>,
      { streamId: string } & PaginationParams
    >({
      query: ({ streamId, ...params }) => ({
        url: `/analytics/streams/${streamId}/viewers`,
        params,
      }),
    }),
    getStreamSessions: builder.query<
      ApiResponse<StreamSession[]>,
      { streamId: string } & PaginationParams
    >({
      query: ({ streamId, ...params }) => ({
        url: `/analytics/streams/${streamId}/sessions`,
        params,
      }),
    }),
    getDashboardMetrics: builder.query<ApiResponse<DashboardMetrics>, void>({
      query: () => "/analytics/dashboard",
    }),
    getHealthCheck: builder.query<ApiResponse<HealthCheck>, void>({
      query: () => "/health",
    }),
  }),
});

export const {
  useGetStreamAnalyticsQuery,
  useGetViewerHistoryQuery,
  useGetStreamSessionsQuery,
  useGetDashboardMetricsQuery,
  useGetHealthCheckQuery,
} = analyticsApi;
