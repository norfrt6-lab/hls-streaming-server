"use client";

import dynamic from "next/dynamic";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StreamTable } from "@/components/dashboard/stream-table";
import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = () => <Skeleton className="h-[300px] w-full rounded-lg" />;

const ViewerChart = dynamic(
  () =>
    import("@/components/dashboard/viewer-chart").then((m) => ({
      default: m.ViewerChart,
    })),
  { loading: ChartSkeleton },
);
const BandwidthChart = dynamic(
  () =>
    import("@/components/dashboard/bandwidth-chart").then((m) => ({
      default: m.BandwidthChart,
    })),
  { loading: ChartSkeleton },
);
const SystemMetrics = dynamic(
  () =>
    import("@/components/dashboard/system-metrics").then((m) => ({
      default: m.SystemMetrics,
    })),
  { loading: ChartSkeleton },
);
const RecentActivity = dynamic(
  () =>
    import("@/components/dashboard/recent-activity").then((m) => ({
      default: m.RecentActivity,
    })),
  { loading: ChartSkeleton },
);

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
