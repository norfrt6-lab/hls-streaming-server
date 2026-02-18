"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuditTable } from "@/components/admin/audit-table";
import { AdminGuard } from "@/components/auth/admin-guard";

const AUDIT_ACTIONS = [
  { value: "USER_CREATED", label: "User Created" },
  { value: "USER_DELETED", label: "User Deleted" },
  { value: "ROLE_CHANGED", label: "Role Changed" },
  { value: "STREAM_STOPPED", label: "Stream Stopped" },
  { value: "USER_BANNED", label: "User Banned" },
  { value: "USER_UNBANNED", label: "User Unbanned" },
  { value: "MESSAGE_DELETED", label: "Message Deleted" },
];

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState<string>("all");

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Track all administrative actions</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {AUDIT_ACTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AuditTable actionFilter={actionFilter === "all" ? undefined : actionFilter} />
      </div>
    </AdminGuard>
  );
}
