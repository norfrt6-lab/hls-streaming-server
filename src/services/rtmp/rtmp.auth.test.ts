import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../common/utils/crypto", () => ({
  hashStreamKey: vi.fn().mockReturnValue("hashed-key"),
}));

vi.mock("../../modules/streams/streams.repository", () => ({
  findByStreamKey: vi.fn(),
}));

vi.mock("../../common/utils/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { validateStreamKey } from "./rtmp.auth";
import * as streamsRepo from "../../modules/streams/streams.repository";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("rtmp.auth.validateStreamKey", () => {
  it("returns stream for valid key", async () => {
    const mockStream = {
      id: "s1",
      streamKey: "hashed-key",
      user: { id: "u1", username: "streamer", role: "streamer" },
    };
    (streamsRepo.findByStreamKey as any).mockResolvedValue(mockStream);

    const result = await validateStreamKey("raw-key");
    expect(result).toEqual(mockStream);
  });

  it("returns null for unknown key", async () => {
    (streamsRepo.findByStreamKey as any).mockResolvedValue(null);

    const result = await validateStreamKey("bad-key");
    expect(result).toBeNull();
  });

  it("returns null when stream has no user", async () => {
    (streamsRepo.findByStreamKey as any).mockResolvedValue({
      id: "s1",
      streamKey: "hashed-key",
      user: null,
    });

    const result = await validateStreamKey("orphan-key");
    expect(result).toBeNull();
  });
});
