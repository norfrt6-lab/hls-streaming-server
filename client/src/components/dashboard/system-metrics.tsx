"use client";

import { useSelector } from "react-redux";
import { Cpu, HardDrive, Database, Wifi } from "lucide-react";
import { selectDashboardMetrics } from "@/store/slices/socket-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatBytes } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
}

function MetricBar({ label, value, max, unit, icon }: MetricBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className={cn("font-medium", pct > 80 && "text-red-500", pct > 60 && pct <= 80 && "text-yellow-500")}>
          {value}
          {unit} / {max}
          {unit}
        </span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}

export function SystemMetrics() {
  const metrics = useSelector(selectDashboardMetrics);

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">System Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">System Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricBar
          label="CPU"
          value={Math.round(metrics.cpu)}
          max={100}
          unit="%"
          icon={<Cpu className="h-3.5 w-3.5" />}
        />
        <MetricBar
          label="Memory"
          value={Math.round(metrics.memory)}
          max={100}
          unit="%"
          icon={<HardDrive className="h-3.5 w-3.5" />}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Wifi className="h-3.5 w-3.5" />
            Bandwidth
          </span>
          <span className="font-medium">{formatBytes(metrics.bandwidth)}/s</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            Uptime
          </span>
          <span className="font-medium">
            {Math.floor(metrics.uptime / 3600)}h {Math.floor((metrics.uptime % 3600) / 60)}m
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
