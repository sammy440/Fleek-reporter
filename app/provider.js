// app/providers.js
"use client";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "system", setTheme: () => {}, toggleTheme: () => {} });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  // Determine system preference
  const systemPrefersDark = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const resolved = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;
    root.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, systemPrefersDark]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
