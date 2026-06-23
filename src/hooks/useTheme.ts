import { useState, useEffect } from "react";

export type Theme = "spring" | "summer" | "fall" | "winter" | "dark";

const VALID_THEMES: Theme[] = ["spring", "summer", "fall", "winter", "dark"];

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("vsign_theme") as Theme;
      if (VALID_THEMES.includes(saved)) return saved;
    } catch {
      return "spring";
    }
    return "spring";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("spring", "summer", "fall", "winter", "dark");
    root.classList.add(theme);
    localStorage.setItem("vsign_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "spring" : "dark"));
  };

  return { theme, setTheme: setThemeState, toggleTheme };
}
