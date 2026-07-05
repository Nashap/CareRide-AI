import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--cr-primary)] ${
        isDark ? "bg-[var(--cr-surface)]" : "bg-[var(--cr-beige)]"
      }`}
      aria-label="Toggle Theme"
    >
      {/* Sun Icon (Left) */}
      <Sun 
        size={14} 
        className={`absolute left-2 z-10 transition-colors duration-300 ${isDark ? "text-[var(--cr-text-muted)]" : "text-[var(--cr-primary)]"}`} 
      />
      
      {/* Moon Icon (Right) */}
      <Moon 
        size={14} 
        className={`absolute right-2 z-10 transition-colors duration-300 ${isDark ? "text-[var(--cr-primary)]" : "text-[var(--cr-text-muted)]"}`} 
      />

      {/* Sliding Circle */}
      <div
        className={`w-6 h-6 rounded-full bg-[var(--cr-card)] shadow-sm transition-transform duration-300 ease-in-out transform ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default ThemeToggle;
