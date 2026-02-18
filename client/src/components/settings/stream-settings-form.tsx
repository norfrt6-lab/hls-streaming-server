"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import {
  useGetStreamsQuery,
  useCreateStreamMutation,
  useUpdateStreamMutation,
} from "@/store/api/streams-api";
import { StreamKeyDisplay } from "@/components/streams/stream-key-display";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";

export function StreamSettingsForm() {
  const user = useSelector(selectCurrentUser);
  const { data } = useGetStreamsQuery(
    { search: user?.username },
    { skip: !user }
  );

  const stream = data?.data?.find((s) => s.userId === user?.id);

  const [createStream, { isLoading: isCreating }] = useCreateStreamMutation();
  const [updateStream, { isLoading: isUpdating }] = useUpdateStreamMutation();

  const [title, setTitle] = useState(stream?.title ?? "");
  const [description, setDescription] = useState(stream?.description ?? "");
  const [category, setCategory] = useState(stream?.category ?? "");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (stream) {
        await updateStream({
          id: stream.id,
          body: { title, description: description || undefined, category: category || undefined },
        }).unwrap();
      } else {
        await createStream({
          title: title || "My Stream",
          description: description || undefined,
          category: category || undefined,
        }).unwrap();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error handled by RTK Query
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Stream Configuration</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="streamTitle">Title</Label>
              <Input
                id="streamTitle"
                placeholder="My awesome stream"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streamDescription">Description</Label>
              <textarea
                id="streamDescription"
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="What's your stream about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {saved ? "Saved!" : isLoading ? "Saving..." : stream ? "Update" : "Create Stream"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {stream && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Stream Key</CardTitle>
          </CardHeader>
          <CardContent>
            <StreamKeyDisplay streamId={stream.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
