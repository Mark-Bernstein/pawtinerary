import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light" | "dog";
const STORAGE_KEY = "pawtinerary.theme.v1";

const readTheme = (): Theme => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : "dog";
  } catch {
    return "dog";
  }
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        theme === "light" ? "#f7f6f1" : theme === "dog" ? "#fff3d8" : "#111b18",
      );
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* The selected theme still works for this session. */
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be inside ThemeProvider");
  return value;
};
