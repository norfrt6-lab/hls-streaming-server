"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import dynamic from "next/dynamic";
import { Calendar, Tag } from "lucide-react";
import { SOCKET_JOIN_STREAM, SOCKET_LEAVE_STREAM } from "@/types/socket";
import { useGetStreamQuery } from "@/store/api/streams-api";
import { selectCurrentUser } from "@/store/slices/auth-slice";
import { resetPlayer } from "@/store/slices/player-slice";
import { formatRelativeTime } from "@/lib/utils";
import { STREAM_STATUS_LABELS } from "@/lib/constants";
import { PlayerControls } from "@/components/player/player-controls";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ChatPanel } from "@/components/chat/chat-panel";
import { StreamSettings } from "@/components/streams/stream-settings";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PlayerWithBoundary = dynamic(
  () =>
    import("@/components/player/player-with-boundary").then((m) => ({
      default: m.PlayerWithBoundary,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full rounded-xl" />,
  },
);

export default function StreamDetailPage() {
  const params = useParams();
  const streamId = params.id as string;
  const dispatch = useDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentUser = useSelector(selectCurrentUser);

  const { data, isLoading, isError } = useGetStreamQuery(streamId, {
    pollingInterval: 5000,
  });
  const stream = data?.data;

  const isOwner = currentUser && stream && currentUser.id === stream.userId;
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isOwner || isAdmin;

  // Join/leave stream room for real-time viewer counts
  useEffect(() => {
    dispatch({ type: SOCKET_JOIN_STREAM, payload: streamId });
    return () => {
      dispatch({ type: SOCKET_LEAVE_STREAM, payload: streamId });
      dispatch(resetPlayer());
    };
  }, [dispatch, streamId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (isError || !stream) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold">Stream not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The stream you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  const displayName = stream.user?.displayName ?? stream.user?.username ?? "Unknown";

  return (
    <div className="space-y-4">
      {/* Main layout: Player + Chat */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left: Player */}
        <div className="flex-1 space-y-2">
          {stream.status === "live" ? (
            <>
              <PlayerWithBoundary
                ref={videoRef}
                src={`/media/live/${stream.id}/master.m3u8`}
                className="rounded-xl overflow-hidden"
              />
              <PlayerControls videoRef={videoRef} />
            </>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-black">
              <p className="text-muted-foreground">Stream is offline</p>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="h-[400px] w-full lg:h-auto lg:w-[340px]">
          <ErrorBoundary>
            <ChatPanel streamId={streamId} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Stream info + Tabs */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{stream.title}</h1>
            <Badge
              variant={stream.status === "live" ? "default" : "secondary"}
              className={stream.status === "live" ? "bg-red-600 text-white hover:bg-red-600" : ""}
            >
              {STREAM_STATUS_LABELS[stream.status] ?? stream.status}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{displayName}</p>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {canEdit && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {stream.description && (
              <p className="text-sm text-foreground/80">{stream.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {stream.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  <span>{stream.category}</span>
                </div>
              )}
              {stream.startedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Started {formatRelativeTime(stream.startedAt)}</span>
                </div>
              )}
            </div>
          </TabsContent>

          {canEdit && (
            <TabsContent value="settings">
              <StreamSettings stream={stream} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
