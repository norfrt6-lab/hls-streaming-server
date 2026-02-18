"use client";

import { useParams } from "next/navigation";
import { StreamSummary } from "@/components/analytics/stream-summary";
import { ViewerTimeline } from "@/components/analytics/viewer-timeline";
import { SessionHistory } from "@/components/analytics/session-history";

export default function StreamAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const streamId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stream Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Performance metrics and viewer history
        </p>
      </div>

      <StreamSummary streamId={streamId} />
      <ViewerTimeline streamId={streamId} />
      <SessionHistory streamId={streamId} />
    </div>
  );
}
