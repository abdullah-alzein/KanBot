import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setAuthMode: Dispatch<SetStateAction<boolean>>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
