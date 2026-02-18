"use client";

import { forwardRef } from "react";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { HlsPlayer } from "@/components/player/hls-player";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerWithBoundaryProps {
  src: string;
  className?: string;
}

function PlayerFallback() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black text-white">
      <AlertCircle className="mb-2 h-10 w-10 text-red-500" />
      <p className="text-sm">The player encountered an error.</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </div>
  );
}

export const PlayerWithBoundary = forwardRef<HTMLVideoElement, PlayerWithBoundaryProps>(
  function PlayerWithBoundary({ src, className }, ref) {
    return (
      <ErrorBoundary fallback={<PlayerFallback />}>
        <HlsPlayer ref={ref} src={src} className={className} />
      </ErrorBoundary>
    );
  },
);
