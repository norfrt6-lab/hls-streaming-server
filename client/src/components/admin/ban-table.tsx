"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { useGetActiveBansQuery, useUnbanUserMutation } from "@/store/api/chat-api";
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

interface BanTableProps {
  search?: string;
}

export function BanTable({ search }: BanTableProps) {
  const [page, setPage] = useState(1);
  const [unbanUser] = useUnbanUserMutation();

  const params: PaginationParams & { search?: string } = {
    page,
    limit: 20,
    ...(search && { search }),
  };

  const { data, isLoading } = useGetActiveBansQuery(params);
  const bans = data?.data ?? [];
  const meta = data?.meta;

  const handleUnban = async (streamId: string, userId: string) => {
    try {
      await unbanUser({ streamId, userId }).unwrap();
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
              <TableHead>User</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Banned By</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No active bans found.
                </TableCell>
              </TableRow>
            ) : (
              bans.map((ban) => (
                <TableRow key={ban.id}>
                  <TableCell className="font-medium">
                    {ban.user?.displayName ?? ban.user?.username ?? ban.userId}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ban.stream?.title ?? ban.streamId}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ban.reason ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ban.issuer?.displayName ?? ban.issuer?.username ?? ban.bannedBy}
                  </TableCell>
                  <TableCell>
                    {ban.expiresAt ? (
                      <Badge variant="outline" className="text-xs">
                        {formatRelativeTime(ban.expiresAt)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Permanent
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUnban(ban.streamId, ban.userId)}
                      title="Unban user"
                    >
                      <ShieldOff className="h-4 w-4" />
                    </Button>
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
            Page {meta.page} of {meta.totalPages} ({meta.total} bans)
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
