"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Stream } from "@/types/api";

interface StreamCardProps {
  stream: Stream;
}

export const StreamCard = memo(function StreamCard({ stream }: StreamCardProps) {
  const router = useRouter();

  const displayName = stream.user?.displayName ?? stream.user?.username ?? "Unknown";

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
      onClick={() => router.push(`/streams/${stream.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        {stream.thumbnailUrl ? (
          <Image
            src={stream.thumbnailUrl}
            alt={stream.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500" />
        )}

        {/* Live badge overlay */}
        {stream.status === "live" && (
          <Badge className="absolute left-2 top-2 bg-red-600 text-white hover:bg-red-600">
            LIVE
          </Badge>
        )}

        {/* Viewer count overlay */}
        {stream.status === "live" && stream.viewerCount !== undefined && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            <Eye className="h-3 w-3" />
            {formatNumber(stream.viewerCount)}
          </div>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold" title={stream.title}>
          {stream.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{displayName}</p>
        {stream.category && (
          <Badge variant="secondary" className="mt-1.5 text-xs">
            {stream.category}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
});
