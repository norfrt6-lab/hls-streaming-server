"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";
import {
  selectPlayerState,
  setPlaying,
  setVolume,
  setMuted,
  setFullscreen,
} from "@/store/slices/player-slice";
import { Button } from "@/components/ui/button";
import { QualitySelector } from "@/components/player/quality-selector";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function PlayerControls({ videoRef }: PlayerControlsProps) {
  const dispatch = useDispatch();
  const { isPlaying, volume, muted, isFullscreen, isBuffering } =
    useSelector(selectPlayerState);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    dispatch(setPlaying(!isPlaying));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      video.muted = false;
    }
    dispatch(setVolume(newVolume));
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !muted;
    }
    dispatch(setMuted(!muted));
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    const container = video.parentElement;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        dispatch(setFullscreen(true));
      } else {
        await document.exitFullscreen();
        dispatch(setFullscreen(false));
      }
    } catch {
      // Fullscreen not supported or denied
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-black/90 px-3 py-2">
      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
        onClick={handlePlayPause}
      >
        {isBuffering ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Volume */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
          onClick={handleMuteToggle}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className={cn(
            "h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30",
            "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          )}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quality */}
      <QualitySelector />

      {/* Fullscreen */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
        onClick={handleFullscreen}
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
