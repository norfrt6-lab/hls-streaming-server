"use client";

import { BarChart3, Clock, Eye, TrendingUp } from "lucide-react";
import { useGetStreamAnalyticsQuery } from "@/store/api/analytics-api";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

interface StreamSummaryProps {
  streamId: string;
}

export function StreamSummary({ streamId }: StreamSummaryProps) {
  const { data, isLoading } = useGetStreamAnalyticsQuery(streamId);
  const summary = data?.data;

  if (isLoading || !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Sessions"
        value={summary.totalSessions}
        icon={BarChart3}
      />
      <StatCard
        label="Total Watch Hours"
        value={`${summary.totalWatchHours.toFixed(1)}h`}
        icon={Clock}
      />
      <StatCard
        label="Avg Viewers"
        value={formatNumber(summary.avgViewers)}
        icon={Eye}
      />
      <StatCard
        label="Peak Viewers"
        value={formatNumber(summary.peakViewers)}
        icon={TrendingUp}
      />
    </div>
  );
}
