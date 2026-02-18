"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectUserRole, selectIsAuthenticated } from "@/store/slices/auth-slice";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const role = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, role, router]);

  // Still loading auth — show nothing (AuthGuard above handles the spinner)
  if (!isAuthenticated || !role) {
    return null;
  }

  if (role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
