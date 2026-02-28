
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { NavBar } from "@/components/layout/nav-bar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "HomIllu - Family Organizer",
  description: "A comprehensive family organizer with multi-language support and interactive family tree.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen bg-background antialiased">
        <AuthProvider>
          <I18nProvider>
            <div className="relative flex min-h-screen flex-col">
              <NavBar />
              <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
            <Toaster />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
