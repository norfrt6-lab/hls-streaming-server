"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration, formatBytes, formatRelativeTime } from "@/lib/utils";
import type { Recording } from "@/types/api";

interface VodCardProps {
  recording: Recording;
}

export const VodCard = memo(function VodCard({ recording }: VodCardProps) {
  return (
    <Link href={`/vod/${recording.id}`}>
      <Card className="overflow-hidden transition-colors hover:bg-accent/50">
        <div className="relative aspect-video bg-muted">
          {recording.thumbnailUrl ? (
            <Image
              src={recording.thumbnailUrl}
              alt={recording.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(recording.durationSeconds)}
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="truncate text-sm font-medium">{recording.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {recording.stream?.user?.displayName ??
                recording.stream?.title ??
                "Unknown"}
            </span>
            <span className="text-border">|</span>
            <span>{formatBytes(recording.fileSize)}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(recording.createdAt)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
