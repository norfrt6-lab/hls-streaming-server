"use client";

import { useParams } from "next/navigation";
import { useGetRecordingQuery, useGetVodManifestQuery } from "@/store/api/vod-api";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { HlsPlayer } from "@/components/player/hls-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatBytes } from "@/lib/utils";

export default function VodDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: recordingData, isLoading } = useGetRecordingQuery(params.id);
  const { data: manifestData } = useGetVodManifestQuery(params.id);
  const recording = recordingData?.data;
  const manifestUrl = manifestData?.data?.url;

  if (isLoading || !recording) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{recording.title}</h1>
        <p className="text-sm text-muted-foreground">
          {recording.stream?.user?.displayName ?? recording.stream?.title ?? "Unknown"} &middot;{" "}
          {new Date(recording.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-black">
        {manifestUrl ? (
          <ErrorBoundary>
            <HlsPlayer src={manifestUrl} />
          </ErrorBoundary>
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
            VOD manifest not available
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recording Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{formatDuration(recording.durationSeconds)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">File Size</p>
              <p className="text-sm font-medium">{formatBytes(recording.fileSize)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                variant={recording.status === "ready" ? "default" : "secondary"}
                className="mt-0.5 text-xs"
              >
                {recording.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {new Date(recording.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
