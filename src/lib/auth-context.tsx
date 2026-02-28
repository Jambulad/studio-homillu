
"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "te";
type Theme = "light" | "dark";

interface User {
  uid: string;
  displayName: string;
  email: string;
  preferredLanguage: Language;
}

interface AuthContextType {
  user: User | null;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Initial data load
    const storedLang = localStorage.getItem("preferredLanguage") as Language;
    const storedTheme = localStorage.getItem("theme") as Theme;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    const timer = setTimeout(() => {
      setUser({
        uid: "user-123",
        displayName: "Srinivas Rao",
        email: "srinivas@example.com",
        preferredLanguage: storedLang || "en",
      });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const setLanguage = (lang: Language) => {
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <AuthContext.Provider value={{ user, setLanguage, theme, toggleTheme, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
