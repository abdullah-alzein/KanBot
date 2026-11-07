import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/useTheme";

type Props = {
  className?: string;
};

export function ThemeToggle({ className = "" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";
  const Icon = theme === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`.trim()}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} theme`}
      onClick={toggleTheme}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
