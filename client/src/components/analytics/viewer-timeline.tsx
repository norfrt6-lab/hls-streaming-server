"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetViewerHistoryQuery } from "@/store/api/analytics-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewerTimelineProps {
  streamId: string;
}

export function ViewerTimeline({ streamId }: ViewerTimelineProps) {
  const { data, isLoading } = useGetViewerHistoryQuery({ streamId, limit: 100 });
  const events = data?.data ?? [];

  const chartData = events.map((event) => ({
    time: new Date(event.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    viewers: event.eventType === "join" ? 1 : -1,
  }));

  // Build cumulative viewer count
  let cumulative = 0;
  const cumulativeData = chartData.map((point) => {
    cumulative += point.viewers;
    return { time: point.time, viewers: Math.max(0, cumulative) };
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Viewer Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Viewer Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {cumulativeData.length === 0 ? (
          <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No viewer data available yet.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="viewerTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="viewers"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#viewerTimelineGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
