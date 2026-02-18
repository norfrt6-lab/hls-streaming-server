import { getActiveTranscodings } from "./transcoder";

export function getTranscodingStatus() {
  const active = getActiveTranscodings();
  return {
    activeCount: active.length,
    streams: active,
  };
}
