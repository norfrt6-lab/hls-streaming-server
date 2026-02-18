import { baseApi } from "./base-api";
import type {
  ApiResponse,
  PaginationParams,
  Stream,
  StreamCreateRequest,
  StreamUpdateRequest,
} from "@/types/api";
import { POLLING_INTERVALS } from "@/lib/constants";

export const streamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStreams: builder.query<
      ApiResponse<Stream[]>,
      PaginationParams & { status?: string; search?: string; userId?: string }
    >({
      query: (params) => ({ url: "/streams", params }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Stream" as const, id })),
              { type: "Stream", id: "LIST" },
            ]
          : [{ type: "Stream", id: "LIST" }],
    }),
    getStream: builder.query<ApiResponse<Stream>, string>({
      query: (id) => `/streams/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Stream", id }],
    }),
    createStream: builder.mutation<ApiResponse<Stream>, StreamCreateRequest>({
      query: (body) => ({ url: "/streams", method: "POST", body }),
      invalidatesTags: [{ type: "Stream", id: "LIST" }],
    }),
    updateStream: builder.mutation<ApiResponse<Stream>, { id: string; body: StreamUpdateRequest }>({
      query: ({ id, body }) => ({
        url: `/streams/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Stream", id }],
    }),
    deleteStream: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/streams/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Stream", id: "LIST" }],
    }),
    getStreamKey: builder.query<ApiResponse<{ streamKey: string }>, string>({
      query: (id) => `/streams/${id}/key`,
    }),
    regenerateStreamKey: builder.mutation<ApiResponse<{ streamKey: string }>, string>({
      query: (id) => ({ url: `/streams/${id}/key`, method: "POST" }),
    }),
    getLiveStreams: builder.query<ApiResponse<Stream[]>, void>({
      query: () => ({ url: "/streams", params: { status: "live" } }),
      providesTags: [{ type: "Stream", id: "LIVE" }],
    }),
    forceStopStream: builder.mutation<ApiResponse<Stream>, string>({
      query: (id) => ({ url: `/streams/${id}/stop`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Stream", id },
        { type: "Stream", id: "LIST" },
        { type: "Stream", id: "LIVE" },
      ],
    }),
  }),
});

export const {
  useGetStreamsQuery,
  useGetStreamQuery,
  useCreateStreamMutation,
  useUpdateStreamMutation,
  useDeleteStreamMutation,
  useGetStreamKeyQuery,
  useRegenerateStreamKeyMutation,
  useGetLiveStreamsQuery,
  useForceStopStreamMutation,
} = streamsApi;
