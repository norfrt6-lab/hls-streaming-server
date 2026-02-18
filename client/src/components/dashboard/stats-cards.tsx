"use client";

import { useSelector } from "react-redux";
import { Radio, Users, Cpu, HardDrive } from "lucide-react";
import { selectDashboardMetrics } from "@/store/slices/socket-slice";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const metrics = useSelector(selectDashboardMetrics);

  if (!metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Active Streams" value={metrics.activeStreams} icon={Radio} />
      <StatCard label="Total Viewers" value={metrics.totalViewers} icon={Users} />
      <StatCard label="CPU Usage" value={`${Math.round(metrics.cpu)}%`} icon={Cpu} />
      <StatCard label="Memory Usage" value={`${Math.round(metrics.memory)}%`} icon={HardDrive} />
    </div>
  );
}
