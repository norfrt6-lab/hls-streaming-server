"use client";

import { useForceStopStreamMutation } from "@/store/api/streams-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Stream } from "@/types/api";

interface ForceStopDialogProps {
  stream: Stream | null;
  onClose: () => void;
}

export function ForceStopDialog({ stream, onClose }: ForceStopDialogProps) {
  const [forceStop, { isLoading }] = useForceStopStreamMutation();

  const handleStop = async () => {
    if (!stream) return;
    try {
      await forceStop(stream.id).unwrap();
      onClose();
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <Dialog open={!!stream} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Force Stop Stream</DialogTitle>
          <DialogDescription>
            Are you sure you want to force stop{" "}
            <span className="font-medium text-foreground">{stream?.title}</span>? This will
            immediately disconnect the streamer and end the session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleStop} disabled={isLoading}>
            {isLoading ? "Stopping..." : "Force Stop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
