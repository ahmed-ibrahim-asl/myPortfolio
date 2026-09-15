"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, normalizeTheme } from "@/lib/theme";

type ThemeName = "dark" | "light";

function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    setTheme(normalizeTheme(document.documentElement.dataset.theme));
  }, []);

  const nextTheme: ThemeName = theme === "dark" ? "light" : "dark";

  const toggleTheme = () => {
    applyTheme(nextTheme);
    setTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The visible preference still applies when browser storage is unavailable.
    }
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "light"}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-action">
        <span aria-hidden="true">{nextTheme === "light" ? "☀" : "☾"}</span>
        <span>{nextTheme === "light" ? "Light" : "Dark"}</span>
      </span>
    </button>
  );
}
