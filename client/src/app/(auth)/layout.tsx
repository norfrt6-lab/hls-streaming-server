"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
