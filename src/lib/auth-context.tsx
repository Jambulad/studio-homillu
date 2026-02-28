
"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  Auth
} from "firebase/auth";
import { useAuth as useFirebaseAuth } from "@/firebase";

type Language = "en" | "te";
type Theme = "light" | "dark";

interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  preferredLanguage: Language;
}

interface AuthContextType {
  user: AuthUser | null;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser, loading: userLoading } = useUser();
  const auth = useFirebaseAuth();
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("preferredLanguage") as Language;
    const storedTheme = localStorage.getItem("theme") as Theme;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    if (storedLang) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const authUser: AuthUser | null = firebaseUser ? {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    preferredLanguage: language
  } : null;

  return (
    <AuthContext.Provider value={{ 
      user: authUser, 
      setLanguage, 
      theme, 
      toggleTheme, 
      isLoading: userLoading,
      signIn,
      signOut: handleSignOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
