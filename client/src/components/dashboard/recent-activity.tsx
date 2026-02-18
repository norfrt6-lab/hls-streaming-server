"use client";

import { useGetStreamsQuery } from "@/store/api/streams-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { Radio, RadioTower } from "lucide-react";

export function RecentActivity() {
  const { data, isLoading } = useGetStreamsQuery({ limit: 10, sort: "updatedAt", order: "desc" });
  const streams = data?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          {streams.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {streams.map((stream) => (
                <div key={stream.id} className="flex items-center gap-3 rounded-md border p-3">
                  <div className="rounded-md bg-primary/10 p-1.5">
                    {stream.status === "live" ? (
                      <RadioTower className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{stream.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {stream.user?.displayName ?? stream.user?.username ?? "Unknown"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={stream.status === "live" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {stream.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(stream.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
