import { describe, it, expect } from "vitest";
import reducer, {
  setCurrentQuality,
  setAvailableQualities,
  setBuffering,
  setPlaying,
  setVolume,
  setMuted,
  resetPlayer,
  selectVolume,
} from "./player-slice";

describe("player-slice", () => {
  it("setCurrentQuality with -1 enables autoQuality", () => {
    const state = reducer(undefined, setCurrentQuality(-1));
    expect(state.currentQuality).toBe(-1);
    expect(state.autoQuality).toBe(true);
  });

  it("setCurrentQuality with specific value disables autoQuality", () => {
    const state = reducer(undefined, setCurrentQuality(720));
    expect(state.currentQuality).toBe(720);
    expect(state.autoQuality).toBe(false);
  });

  it("setAvailableQualities sets the list", () => {
    const state = reducer(
      undefined,
      setAvailableQualities([1080, 720, 480, 360]),
    );
    expect(state.availableQualities).toEqual([1080, 720, 480, 360]);
  });

  it("setBuffering toggles buffering state", () => {
    const state = reducer(undefined, setBuffering(true));
    expect(state.isBuffering).toBe(true);
  });

  it("setPlaying toggles playing state", () => {
    const state = reducer(undefined, setPlaying(true));
    expect(state.isPlaying).toBe(true);
  });

  it("setVolume clamps to [0, 1]", () => {
    const high = reducer(undefined, setVolume(5));
    expect(high.volume).toBe(1);

    const low = reducer(undefined, setVolume(-1));
    expect(low.volume).toBe(0);

    const normal = reducer(undefined, setVolume(0.5));
    expect(normal.volume).toBe(0.5);
  });

  it("setVolume > 0 unmutes", () => {
    let state = reducer(undefined, setMuted(true));
    expect(state.muted).toBe(true);

    state = reducer(state, setVolume(0.8));
    expect(state.muted).toBe(false);
  });

  it("setMuted toggles mute", () => {
    const state = reducer(undefined, setMuted(true));
    expect(state.muted).toBe(true);
  });

  it("resetPlayer returns initial state", () => {
    let state = reducer(undefined, setPlaying(true));
    state = reducer(state, setVolume(0.3));
    state = reducer(state, resetPlayer());

    expect(state.isPlaying).toBe(false);
    expect(state.volume).toBe(1);
    expect(state.currentQuality).toBe(-1);
    expect(state.autoQuality).toBe(true);
  });

  it("selectVolume returns volume and muted", () => {
    const rootState = {
      player: {
        currentQuality: -1,
        autoQuality: true,
        availableQualities: [],
        isBuffering: false,
        isPlaying: false,
        volume: 0.7,
        muted: true,
        isFullscreen: false,
        error: null,
      },
    };
    expect(selectVolume(rootState)).toEqual({ volume: 0.7, muted: true });
  });
});
