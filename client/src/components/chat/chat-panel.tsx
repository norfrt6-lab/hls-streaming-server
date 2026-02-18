"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SOCKET_JOIN_CHAT, SOCKET_LEAVE_CHAT } from "@/types/socket";
import { selectChatRoom } from "@/store/slices/chat-slice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";

interface ChatPanelProps {
  streamId: string;
}

export function ChatPanel({ streamId }: ChatPanelProps) {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector(selectChatRoom(streamId));
  const bottomRef = useRef<HTMLDivElement>(null);

  // Join/leave chat room
  useEffect(() => {
    dispatch({ type: SOCKET_JOIN_CHAT, payload: streamId });
    return () => {
      dispatch({ type: SOCKET_LEAVE_CHAT, payload: streamId });
    };
  }, [dispatch, streamId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <ChatHeader streamId={streamId} />

      <ScrollArea className="flex-1">
        <div role="log" aria-live="polite" aria-label="Chat messages" className="py-2">
          {isLoading ? (
            <div className="space-y-3 px-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <ChatInput streamId={streamId} />
    </div>
  );
}
