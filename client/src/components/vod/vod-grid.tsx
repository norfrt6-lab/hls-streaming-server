"use client";

import { VodCard } from "./vod-card";
import type { Recording } from "@/types/api";

interface VodGridProps {
  recordings: Recording[];
}

export function VodGrid({ recordings }: VodGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recordings.map((recording) => (
        <VodCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
}
