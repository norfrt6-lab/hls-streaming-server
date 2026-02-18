"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
  useGetStreamKeyQuery,
  useRegenerateStreamKeyMutation,
} from "@/store/api/streams-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface StreamKeyDisplayProps {
  streamId: string;
}

export function StreamKeyDisplay({ streamId }: StreamKeyDisplayProps) {
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();

  const { data } = useGetStreamKeyQuery(streamId);
  const [regenerateKey, { isLoading: isRegenerating }] =
    useRegenerateStreamKeyMutation();

  const streamKey = data?.data?.streamKey ?? "";

  const handleCopy = async () => {
    if (!streamKey) return;
    try {
      await navigator.clipboard.writeText(streamKey);
      toast({ title: "Stream key copied to clipboard" });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to regenerate your stream key? Your current key will stop working immediately."
    );
    if (!confirmed) return;

    try {
      await regenerateKey(streamId).unwrap();
      toast({ title: "Stream key regenerated successfully" });
    } catch {
      toast({
        title: "Failed to regenerate",
        description: "Could not regenerate the stream key.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label>Stream Key</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type={visible ? "text" : "password"}
            value={streamKey}
            readOnly
            className="pr-10 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          title="Copy stream key"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          title="Regenerate stream key"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Keep your stream key private. Anyone with this key can stream to your
        channel.
      </p>
    </div>
  );
}
