export interface TranscodingPreset {
  name: string;
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  index: number;
}

export const presets: TranscodingPreset[] = [
  { name: "1080p", width: 1920, height: 1080, videoBitrate: "5000k", audioBitrate: "192k", index: 0 },
  { name: "720p", width: 1280, height: 720, videoBitrate: "2800k", audioBitrate: "128k", index: 1 },
  { name: "480p", width: 854, height: 480, videoBitrate: "1400k", audioBitrate: "128k", index: 2 },
  { name: "360p", width: 640, height: 360, videoBitrate: "800k", audioBitrate: "96k", index: 3 },
];
