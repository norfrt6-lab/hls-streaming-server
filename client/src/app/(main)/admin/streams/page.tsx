"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminStreamTable } from "@/components/admin/admin-stream-table";
import { STREAM_STATUS_LABELS } from "@/lib/constants";
import { AdminGuard } from "@/components/auth/admin-guard";
import type { StreamStatus } from "@/types/api";

export default function AdminStreamsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StreamStatus | "all">("all");

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stream Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage all streams, force stop live streams
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search streams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StreamStatus | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.entries(STREAM_STATUS_LABELS) as [string, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <AdminStreamTable
          search={search || undefined}
          statusFilter={statusFilter === "all" ? undefined : statusFilter}
        />
      </div>
    </AdminGuard>
  );
}
