"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Send } from "lucide-react";
import { SOCKET_SEND_CHAT_MESSAGE } from "@/types/socket";
import { selectSendingMessage, selectRateLimited } from "@/store/slices/chat-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  streamId: string;
}

export function ChatInput({ streamId }: ChatInputProps) {
  const [content, setContent] = useState("");
  const dispatch = useDispatch();
  const sendingMessage = useSelector(selectSendingMessage);
  const { limited: rateLimited, retryAfter } = useSelector(selectRateLimited);

  const isDisabled = sendingMessage || rateLimited;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isDisabled) return;

    dispatch({
      type: SOCKET_SEND_CHAT_MESSAGE,
      payload: { streamId, content: trimmed },
    });
    setContent("");
  };

  return (
    <div className="border-t px-3 py-2">
      {rateLimited && (
        <p className="mb-1 text-xs text-destructive">
          Slow down! Try again{retryAfter ? ` in ${retryAfter}s` : " shortly"}.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Send a message..."
          disabled={isDisabled}
          className="h-8 text-xs"
          maxLength={500}
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={isDisabled || !content.trim()}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
