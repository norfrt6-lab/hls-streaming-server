"use client";

import { useState } from "react";
import { Film } from "lucide-react";
import { useGetRecordingsQuery } from "@/store/api/vod-api";
import { VodGrid } from "@/components/vod/vod-grid";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function VodPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetRecordingsQuery({ search: search || undefined });
  const recordings = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recordings</h1>
        <p className="text-sm text-muted-foreground">Browse past stream recordings</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search recordings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Film className="mb-3 h-10 w-10" />
          <p className="text-sm font-medium">No recordings found</p>
          <p className="text-xs">Recordings will appear here after streams end.</p>
        </div>
      ) : (
        <VodGrid recordings={recordings} />
      )}
    </div>
  );
}
