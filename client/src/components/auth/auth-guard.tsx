"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, setUser } from "@/store/slices/auth-slice";
import { useGetMeQuery } from "@/store/api/auth-api";
import { SOCKET_CONNECT } from "@/types/socket";
import type { RootState } from "@/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !accessToken || !mounted,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (isError) {
      router.replace("/login");
      return;
    }

    if (data?.data) {
      dispatch(setUser(data.data));
      dispatch({ type: SOCKET_CONNECT });
    }
  }, [mounted, accessToken, data, isLoading, isError, router, dispatch]);

  if (!mounted || isLoading || (!isAuthenticated && accessToken)) {
    return (
      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
