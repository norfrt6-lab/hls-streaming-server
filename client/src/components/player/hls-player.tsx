"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import Hls from "hls.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setAvailableQualities,
  setCurrentQuality,
  setBuffering,
  setPlaying,
  setPlayerError,
  selectPlayerState,
} from "@/store/slices/player-slice";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface HlsPlayerProps {
  src: string;
  className?: string;
}

export const HlsPlayer = forwardRef<HTMLVideoElement, HlsPlayerProps>(function HlsPlayer(
  { src, className },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dispatch = useDispatch();
  const { error, currentQuality } = useSelector(selectPlayerState);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  const initPlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    dispatch(setPlayerError(null));

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const qualities = data.levels.map((_, index) => index);
        dispatch(setAvailableQualities(qualities));
        dispatch(setCurrentQuality(-1)); // Auto by default
        // Autoplay muted (browsers allow muted autoplay)
        video.muted = true;
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        if (hlsRef.current && hlsRef.current.autoLevelEnabled) {
          // If auto, don't override the user's auto selection
        } else {
          dispatch(setCurrentQuality(data.level));
        }
      });

      let networkRetries = 0;
      const MAX_NETWORK_RETRIES = 3;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              networkRetries++;
              if (networkRetries <= MAX_NETWORK_RETRIES) {
                dispatch(setPlayerError("Network error - attempting to recover..."));
                hls.startLoad();
              } else {
                dispatch(setPlayerError("Stream is unavailable."));
                hls.destroy();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              dispatch(setPlayerError("Media error - attempting to recover..."));
              hls.recoverMediaError();
              break;
            default:
              dispatch(setPlayerError("An unrecoverable error occurred."));
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
    } else {
      dispatch(setPlayerError("HLS is not supported in this browser."));
    }

    // Video element event listeners
    const handlePlaying = () => {
      dispatch(setPlaying(true));
      dispatch(setBuffering(false));
    };
    const handlePause = () => dispatch(setPlaying(false));
    const handleWaiting = () => dispatch(setBuffering(true));
    const handleCanPlay = () => dispatch(setBuffering(false));

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [src, dispatch]);

  // Initialize player
  useEffect(() => {
    const cleanup = initPlayer();
    return () => {
      cleanup?.();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initPlayer]);

  // Handle quality switching
  useEffect(() => {
    if (!hlsRef.current) return;
    if (currentQuality === -1) {
      hlsRef.current.currentLevel = -1; // Auto
    } else {
      hlsRef.current.currentLevel = currentQuality;
    }
  }, [currentQuality]);

  return (
    <div className={cn("relative aspect-video w-full bg-black", className)}>
      <video
        ref={videoRef}
        className="h-full w-full"
        aria-label="Live stream video player"
        playsInline
        autoPlay
        muted
      />

      {/* Error overlay */}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white"
        >
          <AlertCircle aria-hidden="true" className="mb-2 h-10 w-10 text-red-500" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
});
