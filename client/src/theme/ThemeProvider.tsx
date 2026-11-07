import { useEffect, useLayoutEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { ThemeContext, type Theme } from "./ThemeContext";

const STORAGE_KEY = "kanbot.theme";

function initialTheme(): Theme {
  let theme: Theme;
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
  } catch {
    theme = "light";
  }

  document.documentElement.dataset.theme = theme;
  return theme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [authMode, setAuthMode] = useState(false);
  const effectiveTheme = authMode ? "light" : theme;

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.style.colorScheme = effectiveTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        effectiveTheme === "dark" ? "#111517" : "#f6f7f7",
      );
  }, [effectiveTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works for the current page when storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setAuthMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
