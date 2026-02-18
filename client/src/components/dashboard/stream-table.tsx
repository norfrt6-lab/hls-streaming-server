"use client";

import { useSelector } from "react-redux";
import { Activity, Eye } from "lucide-react";
import { selectDashboardStreams } from "@/store/slices/socket-slice";
import { useGetStreamsQuery } from "@/store/api/streams-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration } from "@/lib/utils";

function HealthBadge({ health }: { health: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        health === "good" && "border-green-500/50 text-green-500",
        health === "warning" && "border-yellow-500/50 text-yellow-500",
        health === "critical" && "border-red-500/50 text-red-500",
      )}
    >
      <Activity className="mr-1 h-3 w-3" />
      {health}
    </Badge>
  );
}

export function StreamTable() {
  const dashboardStreams = useSelector(selectDashboardStreams);
  const { data, isLoading } = useGetStreamsQuery({ status: "live" });
  const streams = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Active Streams ({streams.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {streams.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No streams are currently live.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Streamer</TableHead>
                <TableHead className="text-right">Viewers</TableHead>
                <TableHead className="text-right">Bitrate</TableHead>
                <TableHead className="text-right">FPS</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streams.map((stream) => {
                const liveData = dashboardStreams[stream.id];
                return (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">{stream.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {stream.user?.displayName ?? stream.user?.username ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {liveData?.viewers ?? stream.viewerCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {liveData ? `${Math.round(liveData.bitrate / 1000)}k` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {liveData?.fps ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {liveData ? formatDuration(liveData.duration) : "—"}
                    </TableCell>
                    <TableCell>
                      {liveData ? (
                        <HealthBadge health={liveData.health} />
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
