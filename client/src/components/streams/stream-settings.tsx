"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useUpdateStreamMutation } from "@/store/api/streams-api";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { StreamKeyDisplay } from "@/components/streams/stream-key-display";
import type { Stream } from "@/types/api";

interface StreamSettingsProps {
  stream: Stream;
}

export function StreamSettings({ stream }: StreamSettingsProps) {
  const [title, setTitle] = useState(stream.title);
  const [description, setDescription] = useState(stream.description ?? "");
  const [category, setCategory] = useState(stream.category ?? "");
  const { toast } = useToast();

  const [updateStream, { isLoading }] = useUpdateStreamMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStream({
        id: stream.id,
        body: {
          title,
          description: description || undefined,
          category: category || undefined,
        },
      }).unwrap();
      toast({ title: "Stream settings updated" });
    } catch {
      toast({
        title: "Failed to update",
        description: "Could not update stream settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Stream title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your stream..."
            rows={4}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !title.trim()}>
        <Save className="h-4 w-4" />
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>

      <Separator />

      <StreamKeyDisplay streamId={stream.id} />
    </form>
  );
}
