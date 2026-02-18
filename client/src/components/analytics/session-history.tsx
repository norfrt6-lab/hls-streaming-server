"use client";

import { useGetStreamSessionsQuery } from "@/store/api/analytics-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";

interface SessionHistoryProps {
  streamId: string;
}

export function SessionHistory({ streamId }: SessionHistoryProps) {
  const { data, isLoading } = useGetStreamSessionsQuery({ streamId, limit: 20 });
  const sessions = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
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
        <CardTitle className="text-sm font-medium">
          Session History ({sessions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No past sessions found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Peak Viewers</TableHead>
                <TableHead className="text-right">Avg Bitrate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="text-sm">
                    {new Date(session.startedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {session.durationSeconds
                      ? formatDuration(session.durationSeconds)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {session.peakViewers}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {session.avgBitrate
                      ? `${Math.round(session.avgBitrate / 1000)}k`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={session.status === "ended" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
