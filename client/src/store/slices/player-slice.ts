import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  currentQuality: number;
  autoQuality: boolean;
  availableQualities: number[];
  isBuffering: boolean;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  error: string | null;
}

const initialState: PlayerState = {
  currentQuality: -1,
  autoQuality: true,
  availableQualities: [],
  isBuffering: false,
  isPlaying: false,
  volume: 1,
  muted: false,
  isFullscreen: false,
  error: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentQuality(state, action: PayloadAction<number>) {
      state.currentQuality = action.payload;
      state.autoQuality = action.payload === -1;
    },
    setAvailableQualities(state, action: PayloadAction<number[]>) {
      state.availableQualities = action.payload;
    },
    setBuffering(state, action: PayloadAction<boolean>) {
      state.isBuffering = action.payload;
    },
    setPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
      if (state.volume > 0) state.muted = false;
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.muted = action.payload;
    },
    setFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
    setPlayerError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetPlayer() {
      return initialState;
    },
  },
});

export const {
  setCurrentQuality,
  setAvailableQualities,
  setBuffering,
  setPlaying,
  setVolume,
  setMuted,
  setFullscreen,
  setPlayerError,
  resetPlayer,
} = playerSlice.actions;

export const selectPlayerState = (state: { player: PlayerState }) => state.player;
export const selectCurrentQuality = (state: { player: PlayerState }) => state.player.currentQuality;
export const selectIsBuffering = (state: { player: PlayerState }) => state.player.isBuffering;
export const selectVolume = (state: { player: PlayerState }) => ({
  volume: state.player.volume,
  muted: state.player.muted,
});

export default playerSlice.reducer;
