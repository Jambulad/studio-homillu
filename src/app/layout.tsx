
"use client"

import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { NavBar } from "@/components/layout/nav-bar";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

function RootContent({ children }: { children: React.ReactNode }) {
  const { theme } = useAuth();
  
  return (
    <html lang="en" className={cn(theme)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen bg-background antialiased transition-colors duration-300">
        <I18nProvider>
          <div className="relative flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        <RootContent>
          {children}
        </RootContent>
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
