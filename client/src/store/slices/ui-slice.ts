import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  activeModal: string | null;
}

function getInitialTheme(): "light" | "dark" | "system" {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  }
  return "dark";
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: getInitialTheme(),
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setTheme(state, action: PayloadAction<"light" | "dark" | "system">) {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  openModal,
  closeModal,
} = uiSlice.actions;

export const selectSidebarCollapsed = (state: { ui: UiState }) =>
  state.ui.sidebarCollapsed;
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectActiveModal = (state: { ui: UiState }) =>
  state.ui.activeModal;

export default uiSlice.reducer;
