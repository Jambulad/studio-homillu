"use client"

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
