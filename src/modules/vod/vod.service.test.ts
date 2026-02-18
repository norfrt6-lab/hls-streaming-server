import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./vod.repository", () => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  remove: vi.fn(),
}));

import * as vodService from "./vod.service";
import * as vodRepo from "./vod.repository";

const mockRecording = {
  id: "r1",
  title: "Past Stream",
  hlsPath: "recordings/r1/master.m3u8",
  durationSeconds: 3600,
  fileSize: 1024000,
  status: "ready",
  streamId: "s1",
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("vod.service.listRecordings", () => {
  it("returns paginated recordings", async () => {
    (vodRepo.findMany as any).mockResolvedValue({
      recordings: [mockRecording],
      total: 1,
    });

    const result = await vodService.listRecordings({ page: 1, limit: 20 });
    expect(result.recordings).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});

describe("vod.service.getRecording", () => {
  it("returns recording by id", async () => {
    (vodRepo.findById as any).mockResolvedValue(mockRecording);
    const result = await vodService.getRecording("r1");
    expect(result.id).toBe("r1");
  });

  it("throws notFound for missing recording", async () => {
    (vodRepo.findById as any).mockResolvedValue(null);
    await expect(vodService.getRecording("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("vod.service.deleteRecording", () => {
  it("deletes existing recording", async () => {
    (vodRepo.findById as any).mockResolvedValue(mockRecording);
    (vodRepo.remove as any).mockResolvedValue(undefined);

    await expect(vodService.deleteRecording("r1")).resolves.toBeUndefined();
  });

  it("throws notFound for missing recording", async () => {
    (vodRepo.findById as any).mockResolvedValue(null);
    await expect(vodService.deleteRecording("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("vod.service.getManifest", () => {
  it("returns manifest URL", async () => {
    (vodRepo.findById as any).mockResolvedValue(mockRecording);
    const result = await vodService.getManifest("r1");
    expect(result.url).toBe("/media/recordings/r1/master.m3u8");
  });

  it("throws notFound for missing recording", async () => {
    (vodRepo.findById as any).mockResolvedValue(null);
    await expect(vodService.getManifest("nope")).rejects.toMatchObject({
      status: 404,
    });
  });
});
