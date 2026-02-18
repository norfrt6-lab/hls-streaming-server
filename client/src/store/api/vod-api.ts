import { baseApi } from "./base-api";
import type {
  ApiResponse,
  PaginationParams,
  Recording,
} from "@/types/api";

export const vodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecordings: builder.query<
      ApiResponse<Recording[]>,
      PaginationParams & { search?: string }
    >({
      query: (params) => ({ url: "/vod", params }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Vod" as const, id })),
              { type: "Vod", id: "LIST" },
            ]
          : [{ type: "Vod", id: "LIST" }],
    }),
    getRecording: builder.query<ApiResponse<Recording>, string>({
      query: (id) => `/vod/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Vod", id }],
    }),
    deleteRecording: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/vod/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Vod", id: "LIST" }],
    }),
    getVodManifest: builder.query<ApiResponse<{ url: string }>, string>({
      query: (id) => `/vod/${id}/manifest`,
    }),
  }),
});

export const {
  useGetRecordingsQuery,
  useGetRecordingQuery,
  useDeleteRecordingMutation,
  useGetVodManifestQuery,
} = vodApi;
