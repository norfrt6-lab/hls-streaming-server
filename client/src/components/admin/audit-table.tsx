"use client";

import { useState } from "react";
import { useGetAuditLogsQuery } from "@/store/api/audit-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import type { PaginationParams } from "@/types/api";

const ACTION_LABELS: Record<string, string> = {
  USER_CREATED: "User Created",
  USER_DELETED: "User Deleted",
  ROLE_CHANGED: "Role Changed",
  STREAM_STOPPED: "Stream Stopped",
  USER_BANNED: "User Banned",
  USER_UNBANNED: "User Unbanned",
  MESSAGE_DELETED: "Message Deleted",
};

const ACTION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  USER_CREATED: "default",
  USER_DELETED: "destructive",
  ROLE_CHANGED: "outline",
  STREAM_STOPPED: "destructive",
  USER_BANNED: "destructive",
  USER_UNBANNED: "secondary",
  MESSAGE_DELETED: "secondary",
};

interface AuditTableProps {
  actionFilter?: string;
}

export function AuditTable({ actionFilter }: AuditTableProps) {
  const [page, setPage] = useState(1);

  const params: PaginationParams & { action?: string } = {
    page,
    limit: 20,
    ...(actionFilter && { action: actionFilter }),
  };

  const { data, isLoading } = useGetAuditLogsQuery(params);
  const logs = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.user?.displayName ?? log.user?.username ?? log.userId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ACTION_VARIANTS[log.action] ?? "outline"} className="text-xs">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.targetType}:{log.targetId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} entries)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
