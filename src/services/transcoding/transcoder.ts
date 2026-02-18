import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { config } from "../../config";
import { logger } from "../../common/utils/logger";
import { presets } from "./transcoder.presets";

const activeProcesses = new Map<string, ChildProcess[]>();

function buildMasterPlaylist(streamId: string) {
  const outputDir = path.join(config.media.root, "live", streamId);
  let content = "#EXTM3U\n#EXT-X-VERSION:3\n";

  for (const preset of presets) {
    const bandwidth = parseInt(preset.videoBitrate) * 1000 + parseInt(preset.audioBitrate) * 1000;
    content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${preset.width}x${preset.height},NAME="${preset.name}"\n`;
    content += `${preset.index}/playlist.m3u8\n`;
  }

  fs.writeFileSync(path.join(outputDir, "master.m3u8"), content);
}

export function startTranscoding(streamId: string, streamKey: string) {
  const outputDir = path.join(config.media.root, "live", streamId);

  // Create output directories for each quality
  for (const preset of presets) {
    fs.mkdirSync(path.join(outputDir, String(preset.index)), {
      recursive: true,
    });
  }

  // Build master playlist
  buildMasterPlaylist(streamId);

  // Use HTTP-FLV from NMS internal server for reliable stream reading
  const inputUrl = `http://localhost:8888/live/${streamKey}.flv`;
  const processes: ChildProcess[] = [];

  // Spawn one FFmpeg process per quality preset
  for (const preset of presets) {
    const outPath = path.join(outputDir, String(preset.index));
    const segmentPath = path.join(outPath, "segment_%03d.ts").replace(/\\/g, "/");
    const playlistPath = path.join(outPath, "playlist.m3u8").replace(/\\/g, "/");

    const args: string[] = [
      "-rw_timeout",
      "5000000",
      "-i",
      inputUrl,
      "-loglevel",
      "info",
      "-vf",
      `scale=${preset.width}:${preset.height}`,
      "-c:v",
      "libx264",
      "-b:v",
      preset.videoBitrate,
      "-preset",
      "veryfast",
      "-g",
      "48",
      "-keyint_min",
      "48",
      "-sc_threshold",
      "0",
      "-c:a",
      "aac",
      "-b:a",
      preset.audioBitrate,
      "-f",
      "hls",
      "-hls_time",
      String(config.media.hlsSegmentDuration),
      "-hls_list_size",
      String(config.media.hlsPlaylistSize),
      "-hls_flags",
      "delete_segments+append_list",
      "-hls_segment_filename",
      segmentPath,
      playlistPath,
    ];

    logger.info(
      { streamId, preset: preset.name, cmd: config.ffmpeg.path, args },
      "Spawning FFmpeg transcoder",
    );

    const ffmpeg = spawn(config.ffmpeg.path, args, {
      windowsHide: true,
    });
    processes.push(ffmpeg);

    ffmpeg.stdout?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) logger.info({ streamId, preset: preset.name }, `FFmpeg stdout: ${msg}`);
    });

    ffmpeg.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg) logger.info({ streamId, preset: preset.name }, `FFmpeg: ${msg}`);
    });

    ffmpeg.on("exit", (code, signal) => {
      logger.info({ streamId, preset: preset.name, code, signal }, "FFmpeg process exited");
    });

    ffmpeg.on("error", (err) => {
      logger.error({ err, streamId, preset: preset.name }, "FFmpeg process error");
    });
  }

  activeProcesses.set(streamId, processes);
  logger.info({ streamId }, "Transcoding started for all variants");
}

export function stopTranscoding(streamId: string) {
  const procs = activeProcesses.get(streamId);
  if (procs) {
    for (const proc of procs) {
      if (proc.exitCode !== null) continue; // already exited

      // Send 'q' + end stdin for graceful FFmpeg shutdown
      try {
        proc.stdin?.write("q\n");
        proc.stdin?.end();
      } catch {
        // stdin may not be writable
      }

      // Force kill after 3 seconds if still alive
      const pid = proc.pid;
      setTimeout(() => {
        try {
          if (proc.exitCode === null && pid) {
            // On Windows, proc.kill() sends SIGTERM which doesn't work.
            // Use taskkill to forcefully terminate the process tree.
            if (process.platform === "win32") {
              spawn("taskkill", ["/F", "/T", "/PID", String(pid)], {
                windowsHide: true,
              });
            } else {
              proc.kill("SIGKILL");
            }
          }
        } catch {
          // process may already be dead
        }
      }, 3000);
    }
    activeProcesses.delete(streamId);
    logger.info({ streamId }, "Transcoding stopped");
  }
}

export function getActiveTranscodings(): string[] {
  return Array.from(activeProcesses.keys());
}

export function stopAllTranscodings() {
  for (const streamId of activeProcesses.keys()) {
    stopTranscoding(streamId);
  }
}
