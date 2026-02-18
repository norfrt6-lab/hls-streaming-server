import { describe, it, expect } from "vitest";
import reducer, {
  toggleSidebar,
  setTheme,
  openModal,
  closeModal,
  selectSidebarCollapsed,
  selectTheme,
  selectActiveModal,
} from "./ui-slice";

describe("ui-slice", () => {
  it("toggles sidebar", () => {
    const state1 = reducer(undefined, toggleSidebar());
    expect(state1.sidebarCollapsed).toBe(true);

    const state2 = reducer(state1, toggleSidebar());
    expect(state2.sidebarCollapsed).toBe(false);
  });

  it("sets theme", () => {
    const state = reducer(undefined, setTheme("light"));
    expect(state.theme).toBe("light");
  });

  it("opens and closes modal", () => {
    const state1 = reducer(undefined, openModal("settings"));
    expect(state1.activeModal).toBe("settings");

    const state2 = reducer(state1, closeModal());
    expect(state2.activeModal).toBeNull();
  });

  it("selectors return correct values", () => {
    const rootState = {
      ui: {
        sidebarCollapsed: true,
        theme: "dark" as const,
        activeModal: "confirm",
      },
    };

    expect(selectSidebarCollapsed(rootState)).toBe(true);
    expect(selectTheme(rootState)).toBe("dark");
    expect(selectActiveModal(rootState)).toBe("confirm");
  });
});
