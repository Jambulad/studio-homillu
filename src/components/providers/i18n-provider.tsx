
"use client"

import React, { useEffect, useState } from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth-context";

import en from "@/i18n/locales/en.json";
import te from "@/i18n/locales/te.json";

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user?.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage).then(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [user?.preferredLanguage, i18n]);

  if (!isReady) return null;

  return <>{children}</>;
};
