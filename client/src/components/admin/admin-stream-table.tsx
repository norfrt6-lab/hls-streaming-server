"use client";

import { useState } from "react";
import { MoreHorizontal, StopCircle, Trash2 } from "lucide-react";
import {
  useGetStreamsQuery,
  useDeleteStreamMutation,
} from "@/store/api/streams-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { STREAM_STATUS_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { ForceStopDialog } from "./force-stop-dialog";
import type { Stream, StreamStatus, PaginationParams } from "@/types/api";

interface AdminStreamTableProps {
  search?: string;
  statusFilter?: StreamStatus;
}

export function AdminStreamTable({ search, statusFilter }: AdminStreamTableProps) {
  const [page, setPage] = useState(1);
  const [stopDialogStream, setStopDialogStream] = useState<Stream | null>(null);
  const [deleteStream] = useDeleteStreamMutation();

  const params: PaginationParams & { status?: string; search?: string } = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading } = useGetStreamsQuery(params);
  const streams = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      await deleteStream(id).unwrap();
    } catch {
      // Error handled by RTK Query
    }
  };

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
              <TableHead>Title</TableHead>
              <TableHead>Streamer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {streams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No streams found.
                </TableCell>
              </TableRow>
            ) : (
              streams.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell className="font-medium">{stream.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stream.user?.displayName ?? stream.user?.username ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stream.status === "live" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {STREAM_STATUS_LABELS[stream.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stream.category ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stream.startedAt ? formatRelativeTime(stream.startedAt) : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {stream.status === "live" && (
                          <DropdownMenuItem onClick={() => setStopDialogStream(stream)}>
                            <StopCircle className="mr-2 h-4 w-4" />
                            Force Stop
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(stream.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            Page {meta.page} of {meta.totalPages} ({meta.total} streams)
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

      <ForceStopDialog
        stream={stopDialogStream}
        onClose={() => setStopDialogStream(null)}
      />
    </>
  );
}
