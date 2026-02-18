import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { config } from "../../config";
import { logger } from "../../common/utils/logger";
import { presets } from "./transcoder.presets";

const activeProcesses = new Map<string, ChildProcess>();

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
    fs.mkdirSync(path.join(outputDir, String(preset.index)), { recursive: true });
  }

  // Build master playlist
  buildMasterPlaylist(streamId);

  // Build FFmpeg arguments
  const inputUrl = `rtmp://localhost:${config.rtmpPort}/live/${streamKey}`;
  const args: string[] = [
    "-i", inputUrl,
    "-loglevel", "warning",
  ];

  for (const preset of presets) {
    const outPath = path.join(outputDir, String(preset.index));
    args.push(
      "-map", "0:v:0", "-map", "0:a:0",
      `-c:v`, "libx264",
      `-b:v`, preset.videoBitrate,
      `-s`, `${preset.width}x${preset.height}`,
      `-preset`, "veryfast",
      `-g`, "48",
      `-keyint_min`, "48",
      `-sc_threshold`, "0",
      `-c:a`, "aac",
      `-b:a`, preset.audioBitrate,
      `-f`, "hls",
      `-hls_time`, String(config.media.hlsSegmentDuration),
      `-hls_list_size`, String(config.media.hlsPlaylistSize),
      `-hls_flags`, "delete_segments+append_list",
      `-hls_segment_filename`, path.join(outPath, "segment_%03d.ts"),
      path.join(outPath, "playlist.m3u8"),
    );
  }

  const ffmpeg = spawn(config.ffmpeg.path, args);
  activeProcesses.set(streamId, ffmpeg);

  ffmpeg.stderr?.on("data", (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) logger.debug({ streamId }, `FFmpeg: ${msg}`);
  });

  ffmpeg.on("exit", (code) => {
    activeProcesses.delete(streamId);
    logger.info({ streamId, code }, "FFmpeg process exited");
  });

  ffmpeg.on("error", (err) => {
    activeProcesses.delete(streamId);
    logger.error({ err, streamId }, "FFmpeg process error");
  });

  logger.info({ streamId }, "Transcoding started");
}

export function stopTranscoding(streamId: string) {
  const proc = activeProcesses.get(streamId);
  if (proc) {
    proc.kill("SIGTERM");
    activeProcesses.delete(streamId);
    logger.info({ streamId }, "Transcoding stopped");
  }
}

export function getActiveTranscodings(): string[] {
  return Array.from(activeProcesses.keys());
}
