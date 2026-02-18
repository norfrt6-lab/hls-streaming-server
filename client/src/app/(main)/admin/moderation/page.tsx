"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BanTable } from "@/components/admin/ban-table";

export default function ModerationPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Manage active bans across all streams
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by user or stream..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <BanTable search={search || undefined} />
    </div>
  );
}
