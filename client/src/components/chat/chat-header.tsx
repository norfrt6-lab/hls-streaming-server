"use client";

import { useSelector } from "react-redux";
import { MessageSquare, Users } from "lucide-react";
import { selectViewerCount } from "@/store/slices/socket-slice";
import { formatNumber } from "@/lib/utils";

interface ChatHeaderProps {
  streamId: string;
}

export function ChatHeader({ streamId }: ChatHeaderProps) {
  const { count } = useSelector(selectViewerCount(streamId));

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Live Chat</h3>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{formatNumber(count)}</span>
      </div>
    </div>
  );
}
