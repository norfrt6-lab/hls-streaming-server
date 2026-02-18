import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessageReceived } from "@/types/socket";

interface ChatRoom {
  messages: ChatMessageReceived[];
  isLoading: boolean;
}

interface ChatState {
  rooms: Record<string, ChatRoom>;
  typingUsers: Record<string, string[]>;
  sendingMessage: boolean;
  rateLimited: boolean;
  rateLimitRetryAfter: number | null;
}

const initialState: ChatState = {
  rooms: {},
  typingUsers: {},
  sendingMessage: false,
  rateLimited: false,
  rateLimitRetryAfter: null,
};

const MAX_MESSAGES = 200;

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    initRoom(state, action: PayloadAction<string>) {
      if (!state.rooms[action.payload]) {
        state.rooms[action.payload] = { messages: [], isLoading: true };
      }
    },
    setHistory(
      state,
      action: PayloadAction<{ streamId: string; messages: ChatMessageReceived[] }>
    ) {
      const { streamId, messages } = action.payload;
      state.rooms[streamId] = { messages, isLoading: false };
    },
    addMessage(
      state,
      action: PayloadAction<{ streamId: string; message: ChatMessageReceived }>
    ) {
      const { streamId, message } = action.payload;
      if (!state.rooms[streamId]) {
        state.rooms[streamId] = { messages: [], isLoading: false };
      }
      state.rooms[streamId].messages.push(message);
      if (state.rooms[streamId].messages.length > MAX_MESSAGES) {
        state.rooms[streamId].messages.shift();
      }
    },
    removeMessage(
      state,
      action: PayloadAction<{ streamId: string; messageId: string }>
    ) {
      const { streamId, messageId } = action.payload;
      const room = state.rooms[streamId];
      if (room) {
        room.messages = room.messages.filter((m) => m.id !== messageId);
      }
    },
    clearRoom(state, action: PayloadAction<string>) {
      delete state.rooms[action.payload];
      delete state.typingUsers[action.payload];
    },
    setTypingUser(
      state,
      action: PayloadAction<{ streamId: string; username: string }>
    ) {
      const { streamId, username } = action.payload;
      if (!state.typingUsers[streamId]) {
        state.typingUsers[streamId] = [];
      }
      if (!state.typingUsers[streamId].includes(username)) {
        state.typingUsers[streamId].push(username);
      }
    },
    removeTypingUser(
      state,
      action: PayloadAction<{ streamId: string; username: string }>
    ) {
      const { streamId, username } = action.payload;
      if (state.typingUsers[streamId]) {
        state.typingUsers[streamId] = state.typingUsers[streamId].filter(
          (u) => u !== username
        );
      }
    },
    setSendingMessage(state, action: PayloadAction<boolean>) {
      state.sendingMessage = action.payload;
    },
    setRateLimited(
      state,
      action: PayloadAction<{ limited: boolean; retryAfter: number | null }>
    ) {
      state.rateLimited = action.payload.limited;
      state.rateLimitRetryAfter = action.payload.retryAfter;
    },
    resetChat() {
      return initialState;
    },
  },
});

export const {
  initRoom,
  setHistory,
  addMessage,
  removeMessage,
  clearRoom,
  setTypingUser,
  removeTypingUser,
  setSendingMessage,
  setRateLimited,
  resetChat,
} = chatSlice.actions;

export const selectChatRoom = (streamId: string) => (state: { chat: ChatState }) =>
  state.chat.rooms[streamId] ?? { messages: [], isLoading: true };
export const selectTypingUsers = (streamId: string) => (state: { chat: ChatState }) =>
  state.chat.typingUsers[streamId] ?? [];
export const selectSendingMessage = (state: { chat: ChatState }) => state.chat.sendingMessage;
export const selectRateLimited = (state: { chat: ChatState }) => ({
  limited: state.chat.rateLimited,
  retryAfter: state.chat.rateLimitRetryAfter,
});

export default chatSlice.reducer;
