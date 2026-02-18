"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Radio,
  Film,
  Users,
  MonitorStop,
  ShieldAlert,
  ScrollText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./nav-item";
import { selectSidebarCollapsed, toggleSidebar } from "@/store/slices/ui-slice";
import { selectUserRole } from "@/store/slices/auth-slice";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/streams", icon: Radio, label: "Streams" },
  { href: "/vod", icon: Film, label: "Recordings" },
];

const adminNavigation = [
  { href: "/users", icon: Users, label: "Users" },
  { href: "/admin/streams", icon: MonitorStop, label: "Streams" },
  { href: "/admin/moderation", icon: ShieldAlert, label: "Moderation" },
  { href: "/admin/audit", icon: ScrollText, label: "Audit Log" },
];

const bottomNavigation = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectSidebarCollapsed);
  const role = useSelector(selectUserRole);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b px-4",
          collapsed && "justify-center px-2",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">HLS Stream</span>
          </div>
        )}
        {collapsed && <Radio className="h-5 w-5 text-primary" />}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}

        {role === "admin" && (
          <>
            <Separator className="my-2" />
            {adminNavigation.map((item) => (
              <NavItem key={item.href} {...item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      <div className="space-y-1 p-2">
        <Separator className="mb-2" />
        {bottomNavigation.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            "w-full",
            collapsed ? "justify-center px-2" : "justify-start",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
