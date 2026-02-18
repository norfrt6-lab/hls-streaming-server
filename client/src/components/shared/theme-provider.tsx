"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "@/store/slices/ui-slice";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);

      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }

    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
