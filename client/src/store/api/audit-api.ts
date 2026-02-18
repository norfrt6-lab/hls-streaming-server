import { baseApi } from "./base-api";
import type { ApiResponse, AuditLog, PaginationParams } from "@/types/api";

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      ApiResponse<AuditLog[]>,
      PaginationParams & { action?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({ url: "/audit", params }),
      providesTags: [{ type: "AuditLog", id: "LIST" }],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
