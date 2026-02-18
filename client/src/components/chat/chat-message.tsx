import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { ChatMessageReceived } from "@/types/socket";

interface ChatMessageProps {
  message: ChatMessageReceived;
}

export const ChatMessage = memo(function ChatMessage({
  message,
}: ChatMessageProps) {
  const displayName = message.displayName ?? message.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-2 px-3 py-1.5">
      <Avatar className="h-6 w-6 shrink-0">
        {message.avatarUrl && (
          <AvatarImage src={message.avatarUrl} alt={displayName} />
        )}
        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold">{displayName}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>
        <p className="break-words text-xs text-foreground/90">
          {message.content}
        </p>
      </div>
    </div>
  );
});
