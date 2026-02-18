"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, setUser } from "@/store/slices/auth-slice";
import { useGetMeQuery } from "@/store/api/auth-api";
import { SOCKET_CONNECT } from "@/types/socket";
import type { RootState } from "@/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (data?.data) {
      dispatch(setUser(data.data));
      dispatch({ type: SOCKET_CONNECT });
    }

    if (isError) {
      router.replace("/login");
    }
  }, [accessToken, data, isError, router, dispatch]);

  if (isLoading || (!isAuthenticated && accessToken)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
