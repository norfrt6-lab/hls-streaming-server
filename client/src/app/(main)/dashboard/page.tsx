"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { ViewerChart } from "@/components/dashboard/viewer-chart";
import { StreamTable } from "@/components/dashboard/stream-table";
import { SystemMetrics } from "@/components/dashboard/system-metrics";
import { BandwidthChart } from "@/components/dashboard/bandwidth-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Real-time server overview and stream analytics
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <ViewerChart />
        <BandwidthChart />
      </div>

      <StreamTable />

      <div className="grid gap-6 lg:grid-cols-2">
        <SystemMetrics />
        <RecentActivity />
      </div>
    </div>
  );
}
