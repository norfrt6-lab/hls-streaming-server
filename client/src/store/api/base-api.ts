import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/constants";
import { clearAuth, setTokens } from "@/store/slices/auth-slice";
import type { RootState } from "@/store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as {
          data: { accessToken: string; refreshToken: string };
        };
        api.dispatch(
          setTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          })
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearAuth());
      }
    } else {
      api.dispatch(clearAuth());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Stream", "Analytics", "Chat", "Vod", "Users"],
  endpoints: () => ({}),
});
