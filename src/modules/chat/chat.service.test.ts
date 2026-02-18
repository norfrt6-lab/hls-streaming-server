import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./chat.repository", () => ({
  getActiveSession: vi.fn(),
  findMessages: vi.fn(),
  createMessage: vi.fn(),
  deleteMessage: vi.fn(),
  findBan: vi.fn(),
  createBan: vi.fn(),
  removeBan: vi.fn(),
}));

import * as chatService from "./chat.service";
import * as chatRepo from "./chat.repository";

const mockSession = { id: "sess1", streamId: "s1", status: "live" };
const mockMessage = {
  id: "m1",
  sessionId: "sess1",
  userId: "u1",
  content: "Hello",
  isDeleted: false,
  createdAt: new Date(),
  user: { id: "u1", username: "alice", displayName: "Alice", avatarUrl: null },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("chat.service.getMessages", () => {
  it("returns paginated messages for active session", async () => {
    (chatRepo.getActiveSession as any).mockResolvedValue(mockSession);
    (chatRepo.findMessages as any).mockResolvedValue({
      messages: [mockMessage],
      total: 1,
    });

    const result = await chatService.getMessages("s1", {
      page: 1,
      limit: 50,
    });
    expect(result.messages).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("returns empty when no active session", async () => {
    (chatRepo.getActiveSession as any).mockResolvedValue(null);

    const result = await chatService.getMessages("s1", {
      page: 1,
      limit: 50,
    });
    expect(result.messages).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("chat.service.sendMessage", () => {
  it("creates a message", async () => {
    (chatRepo.findBan as any).mockResolvedValue(null);
    (chatRepo.getActiveSession as any).mockResolvedValue(mockSession);
    (chatRepo.createMessage as any).mockResolvedValue(mockMessage);

    const result = await chatService.sendMessage("s1", "u1", "  Hello  ");
    expect(chatRepo.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Hello" }),
    );
  });

  it("throws forbidden when user is banned (no expiry)", async () => {
    (chatRepo.findBan as any).mockResolvedValue({
      streamId: "s1",
      userId: "u1",
      expiresAt: null,
    });

    await expect(chatService.sendMessage("s1", "u1", "Hi")).rejects.toMatchObject({ status: 403 });
  });

  it("throws forbidden when ban has not expired", async () => {
    const future = new Date(Date.now() + 3600_000);
    (chatRepo.findBan as any).mockResolvedValue({
      streamId: "s1",
      userId: "u1",
      expiresAt: future,
    });

    await expect(chatService.sendMessage("s1", "u1", "Hi")).rejects.toMatchObject({ status: 403 });
  });

  it("allows message when ban has expired", async () => {
    const past = new Date(Date.now() - 3600_000);
    (chatRepo.findBan as any).mockResolvedValue({
      streamId: "s1",
      userId: "u1",
      expiresAt: past,
    });
    (chatRepo.removeBan as any).mockResolvedValue(undefined);
    (chatRepo.getActiveSession as any).mockResolvedValue(mockSession);
    (chatRepo.createMessage as any).mockResolvedValue(mockMessage);

    await expect(chatService.sendMessage("s1", "u1", "Hi")).resolves.toBeDefined();
    expect(chatRepo.removeBan).toHaveBeenCalled();
  });

  it("throws badRequest when stream is not live", async () => {
    (chatRepo.findBan as any).mockResolvedValue(null);
    (chatRepo.getActiveSession as any).mockResolvedValue(null);

    await expect(chatService.sendMessage("s1", "u1", "Hi")).rejects.toMatchObject({ status: 400 });
  });
});

describe("chat.service.deleteMessage", () => {
  it("soft-deletes a message", async () => {
    (chatRepo.deleteMessage as any).mockResolvedValue({
      ...mockMessage,
      isDeleted: true,
    });

    const result = await chatService.deleteMessage("m1");
    expect(chatRepo.deleteMessage).toHaveBeenCalledWith("m1");
  });
});

describe("chat.service.banUser", () => {
  it("creates a ban", async () => {
    (chatRepo.findBan as any).mockResolvedValue(null);
    (chatRepo.createBan as any).mockResolvedValue({
      streamId: "s1",
      userId: "u2",
      bannedBy: "u1",
    });

    await chatService.banUser("s1", "u2", "u1", "spam");
    expect(chatRepo.createBan).toHaveBeenCalledWith(
      expect.objectContaining({ streamId: "s1", userId: "u2", reason: "spam" }),
    );
  });

  it("throws conflict on duplicate ban", async () => {
    (chatRepo.findBan as any).mockResolvedValue({ streamId: "s1", userId: "u2" });

    await expect(chatService.banUser("s1", "u2", "u1")).rejects.toMatchObject({ status: 409 });
  });
});

describe("chat.service.unbanUser", () => {
  it("removes a ban", async () => {
    (chatRepo.removeBan as any).mockResolvedValue(undefined);

    await expect(chatService.unbanUser("s1", "u2")).resolves.toBeUndefined();
  });

  it("throws notFound when ban does not exist", async () => {
    (chatRepo.removeBan as any).mockRejectedValue(new Error("not found"));

    await expect(chatService.unbanUser("s1", "u2")).rejects.toMatchObject({ status: 404 });
  });
});
