import { useState, useEffect } from "react";

export type Theme = "spring" | "summer" | "fall" | "winter" | "dark";

const VALID_THEMES: Theme[] = ["spring", "summer", "fall", "winter", "dark"];

// Global state for theme listeners
let globalTheme: Theme = (() => {
  try {
    const saved = localStorage.getItem("vsign_theme") as Theme;
    if (VALID_THEMES.includes(saved)) return saved;
  } catch {
    // Ignore error
  }
  return "spring";
})();

const listeners = new Set<(theme: Theme) => void>();

function setGlobalTheme(nextTheme: Theme) {
  globalTheme = nextTheme;
  try {
    localStorage.setItem("vsign_theme", nextTheme);
  } catch {
    // Ignore error
  }

  
  // Update class list on HTML element
  const root = document.documentElement;
  root.classList.remove("spring", "summer", "fall", "winter", "dark");
  root.classList.add(nextTheme);

  // Notify all active hooks
  listeners.forEach((listener) => listener(nextTheme));
}

// Apply theme class on page load
if (typeof document !== "undefined") {
  const root = document.documentElement;
  root.classList.remove("spring", "summer", "fall", "winter", "dark");
  root.classList.add(globalTheme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(globalTheme);

  useEffect(() => {
    listeners.add(setThemeState);
    return () => {
      listeners.delete(setThemeState);
    };
  }, []);

  const toggleTheme = () => {
    setGlobalTheme(globalTheme === "dark" ? "spring" : "dark");
  };

  return {
    theme,
    setTheme: setGlobalTheme,
    toggleTheme,
  };
}
