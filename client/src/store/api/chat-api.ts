import { baseApi } from "./base-api";
import type {
  ApiResponse,
  BanUserRequest,
  ChatMessage,
  PaginationParams,
  UserBan,
} from "@/types/api";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatMessages: builder.query<
      ApiResponse<ChatMessage[]>,
      { streamId: string } & PaginationParams
    >({
      query: ({ streamId, ...params }) => ({
        url: `/streams/${streamId}/chat`,
        params,
      }),
      providesTags: (_result, _error, { streamId }) => [
        { type: "Chat", id: streamId },
      ],
    }),
    banUser: builder.mutation<
      ApiResponse<UserBan>,
      { streamId: string; body: BanUserRequest }
    >({
      query: ({ streamId, body }) => ({
        url: `/streams/${streamId}/chat/ban`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { streamId }) => [
        { type: "Chat", id: streamId },
      ],
    }),
    unbanUser: builder.mutation<
      ApiResponse<null>,
      { streamId: string; userId: string }
    >({
      query: ({ streamId, userId }) => ({
        url: `/streams/${streamId}/chat/ban/${userId}`,
        method: "DELETE",
      }),
    }),
    deleteChatMessage: builder.mutation<
      ApiResponse<null>,
      { streamId: string; messageId: string }
    >({
      query: ({ streamId, messageId }) => ({
        url: `/streams/${streamId}/chat/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { streamId }) => [
        { type: "Chat", id: streamId },
      ],
    }),
  }),
});

export const {
  useGetChatMessagesQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useDeleteChatMessageMutation,
} = chatApi;
