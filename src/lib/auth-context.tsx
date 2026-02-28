
"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "te";

interface User {
  uid: string;
  displayName: string;
  email: string;
  preferredLanguage: Language;
}

interface AuthContextType {
  user: User | null;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock initial load from "Firebase/Firestore"
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser({
        uid: "user-123",
        displayName: "Srinivas Rao",
        email: "srinivas@example.com",
        preferredLanguage: (localStorage.getItem("preferredLanguage") as Language) || "en",
      });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const setLanguage = (lang: Language) => {
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      localStorage.setItem("preferredLanguage", lang);
      // In a real app, you'd update Firestore: 
      // await updateDoc(doc(db, 'users', user.uid), { preferredLanguage: lang });
    }
  };

  return (
    <AuthContext.Provider value={{ user, setLanguage, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
