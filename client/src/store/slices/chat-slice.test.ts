import { describe, it, expect } from "vitest";
import reducer, {
  initRoom,
  setHistory,
  addMessage,
  removeMessage,
  setTypingUser,
  removeTypingUser,
  setRateLimited,
  resetChat,
} from "./chat-slice";
import type { ChatMessageReceived } from "@/types/socket";

function createMsg(id: string): ChatMessageReceived {
  return {
    id,
    userId: "u1",
    username: "alice",
    displayName: "Alice",
    avatarUrl: null,
    content: `Message ${id}`,
    timestamp: new Date().toISOString(),
  };
}

describe("chat-slice", () => {
  it("initRoom creates empty room", () => {
    const state = reducer(undefined, initRoom("s1"));
    expect(state.rooms["s1"]).toEqual({ messages: [], isLoading: true });
  });

  it("setHistory sets messages", () => {
    const initial = reducer(undefined, initRoom("s1"));
    const msgs = [createMsg("m1"), createMsg("m2")];
    const state = reducer(initial, setHistory({ streamId: "s1", messages: msgs }));

    expect(state.rooms["s1"].messages).toHaveLength(2);
    expect(state.rooms["s1"].isLoading).toBe(false);
  });

  it("addMessage appends message", () => {
    const initial = reducer(undefined, initRoom("s1"));
    const state = reducer(initial, addMessage({ streamId: "s1", message: createMsg("m1") }));
    expect(state.rooms["s1"].messages).toHaveLength(1);
  });

  it("addMessage rotates at MAX_MESSAGES (200)", () => {
    let state = reducer(undefined, initRoom("s1"));
    for (let i = 0; i < 201; i++) {
      state = reducer(state, addMessage({ streamId: "s1", message: createMsg(`m${i}`) }));
    }
    expect(state.rooms["s1"].messages).toHaveLength(200);
    // First message should have been shifted out
    expect(state.rooms["s1"].messages[0].id).toBe("m1");
  });

  it("removeMessage removes by id", () => {
    let state = reducer(undefined, initRoom("s1"));
    state = reducer(state, addMessage({ streamId: "s1", message: createMsg("m1") }));
    state = reducer(state, addMessage({ streamId: "s1", message: createMsg("m2") }));
    state = reducer(state, removeMessage({ streamId: "s1", messageId: "m1" }));

    expect(state.rooms["s1"].messages).toHaveLength(1);
    expect(state.rooms["s1"].messages[0].id).toBe("m2");
  });

  it("setTypingUser and removeTypingUser work", () => {
    let state = reducer(undefined, setTypingUser({ streamId: "s1", username: "bob" }));
    expect(state.typingUsers["s1"]).toEqual(["bob"]);

    state = reducer(state, removeTypingUser({ streamId: "s1", username: "bob" }));
    expect(state.typingUsers["s1"]).toEqual([]);
  });

  it("setRateLimited updates state", () => {
    const state = reducer(undefined, setRateLimited({ limited: true, retryAfter: 5 }));
    expect(state.rateLimited).toBe(true);
    expect(state.rateLimitRetryAfter).toBe(5);
  });

  it("resetChat returns initial state", () => {
    let state = reducer(undefined, initRoom("s1"));
    state = reducer(state, addMessage({ streamId: "s1", message: createMsg("m1") }));
    state = reducer(state, resetChat());

    expect(state.rooms).toEqual({});
    expect(state.typingUsers).toEqual({});
    expect(state.sendingMessage).toBe(false);
  });
});
