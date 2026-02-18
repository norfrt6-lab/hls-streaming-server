import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../../common/utils/errors";

vi.mock("./streams.repository", () => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  findByStreamKey: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../common/utils/crypto", () => ({
  generateStreamKey: vi.fn().mockReturnValue("raw-key-uuid"),
  hashStreamKey: vi.fn().mockReturnValue("hashed-key"),
}));

import * as streamsService from "./streams.service";
import * as streamsRepo from "./streams.repository";

const mockStream = {
  id: "s1",
  title: "Test Stream",
  description: null,
  category: null,
  status: "offline",
  streamKey: "hashed-key",
  userId: "u1",
  user: { id: "u1", username: "streamer", displayName: null, avatarUrl: null },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("streams.service.listStreams", () => {
  it("returns paginated results with stream keys stripped", async () => {
    (streamsRepo.findMany as any).mockResolvedValue({
      streams: [mockStream],
      total: 1,
    });

    const result = await streamsService.listStreams({ page: 1, limit: 20 });
    expect(result.streams[0]).not.toHaveProperty("streamKey");
    expect(result.total).toBe(1);
  });
});

describe("streams.service.getStream", () => {
  it("returns stream without streamKey", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    const result = await streamsService.getStream("s1");
    expect(result).not.toHaveProperty("streamKey");
    expect(result.id).toBe("s1");
  });

  it("throws notFound for missing stream", async () => {
    (streamsRepo.findById as any).mockResolvedValue(null);
    await expect(streamsService.getStream("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("streams.service.createStream", () => {
  it("creates stream with hashed key and returns raw key", async () => {
    (streamsRepo.create as any).mockResolvedValue(mockStream);

    const result = await streamsService.createStream("u1", {
      title: "My Stream",
    });

    expect(result.streamKey).toBe("raw-key-uuid");
    expect(streamsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ streamKey: "hashed-key" }),
    );
  });
});

describe("streams.service.updateStream", () => {
  it("allows owner to update", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    (streamsRepo.update as any).mockResolvedValue({
      ...mockStream,
      title: "Updated",
    });

    const result = await streamsService.updateStream("s1", "u1", "streamer", {
      title: "Updated",
    });
    expect(result.id).toBe("s1");
  });

  it("allows admin to update any stream", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    (streamsRepo.update as any).mockResolvedValue(mockStream);

    await expect(
      streamsService.updateStream("s1", "other-user", "admin", {
        title: "X",
      }),
    ).resolves.toBeDefined();
  });

  it("throws forbidden for non-owner non-admin", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);

    await expect(
      streamsService.updateStream("s1", "other-user", "viewer", {
        title: "X",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("throws notFound for missing stream", async () => {
    (streamsRepo.findById as any).mockResolvedValue(null);

    await expect(
      streamsService.updateStream("nope", "u1", "admin", { title: "X" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe("streams.service.deleteStream", () => {
  it("allows owner to delete", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    (streamsRepo.remove as any).mockResolvedValue(undefined);

    await expect(
      streamsService.deleteStream("s1", "u1", "streamer"),
    ).resolves.toBeUndefined();
  });

  it("allows admin to delete any stream", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    (streamsRepo.remove as any).mockResolvedValue(undefined);

    await expect(
      streamsService.deleteStream("s1", "other", "admin"),
    ).resolves.toBeUndefined();
  });

  it("throws forbidden for non-owner non-admin", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);

    await expect(
      streamsService.deleteStream("s1", "other", "viewer"),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe("streams.service.getStreamKey", () => {
  it("returns masked key for owner", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    const result = await streamsService.getStreamKey("s1", "u1", "streamer");
    expect(result.streamKey).toBe("****");
  });

  it("throws forbidden for non-owner", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    await expect(
      streamsService.getStreamKey("s1", "other", "viewer"),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe("streams.service.regenerateStreamKey", () => {
  it("generates new key for owner", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);
    (streamsRepo.update as any).mockResolvedValue(mockStream);

    const result = await streamsService.regenerateStreamKey(
      "s1",
      "u1",
      "streamer",
    );
    expect(result.streamKey).toBe("raw-key-uuid");
  });

  it("throws forbidden for non-owner", async () => {
    (streamsRepo.findById as any).mockResolvedValue(mockStream);

    await expect(
      streamsService.regenerateStreamKey("s1", "other", "viewer"),
    ).rejects.toMatchObject({ status: 403 });
  });
});
