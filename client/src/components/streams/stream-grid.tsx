"use client";

import { StreamCard } from "@/components/streams/stream-card";
import type { Stream } from "@/types/api";

interface StreamGridProps {
  streams: Stream[];
}

export function StreamGrid({ streams }: StreamGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {streams.map((stream) => (
        <StreamCard key={stream.id} stream={stream} />
      ))}
    </div>
  );
}
