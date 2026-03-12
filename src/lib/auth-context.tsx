
"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { useAuth as useFirebaseAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser, loading: userLoading } = useUser();
  const auth = useFirebaseAuth();
  const { toast } = useToast();
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Welcome!", description: "Successfully signed in with Google." });
    } catch (error: any) {
      console.error("Error signing in", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Google.",
      });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Welcome back!", description: "Successfully signed in." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
      });
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      toast({ title: "Account Created", description: "Welcome to HomIllu!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "Could not create account.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "See you again soon!" });
    } catch (error: any) {
      console.error("Error signing out", error);
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "Failed to sign out properly.",
      });
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
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
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
