import { describe, it, expect } from "vitest";
import reducer, {
  setCredentials,
  setTokens,
  clearAuth,
  selectCurrentUser,
  selectIsAuthenticated,
} from "./auth-slice";

const mockUser = {
  id: "u1",
  username: "alice",
  email: "alice@example.com",
  displayName: "Alice",
  avatarUrl: null,
  role: "viewer" as const,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("auth-slice", () => {
  it("sets credentials", () => {
    const state = reducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: "at",
        refreshToken: "rt",
      }),
    );

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe("at");
    expect(state.refreshToken).toBe("rt");
    expect(state.isAuthenticated).toBe(true);
  });

  it("sets tokens only", () => {
    const initial = reducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: "old-at",
        refreshToken: "old-rt",
      }),
    );

    const state = reducer(
      initial,
      setTokens({ accessToken: "new-at", refreshToken: "new-rt" }),
    );

    expect(state.accessToken).toBe("new-at");
    expect(state.refreshToken).toBe("new-rt");
    expect(state.user).toEqual(mockUser);
  });

  it("clears auth state", () => {
    const loggedIn = reducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: "at",
        refreshToken: "rt",
      }),
    );

    const state = reducer(loggedIn, clearAuth());

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("selectors return correct values", () => {
    const rootState = {
      auth: {
        user: mockUser,
        accessToken: "at",
        refreshToken: "rt",
        isAuthenticated: true,
      },
    };

    expect(selectCurrentUser(rootState)).toEqual(mockUser);
    expect(selectIsAuthenticated(rootState)).toBe(true);
  });
});
