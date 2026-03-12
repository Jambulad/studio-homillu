
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { NavBar } from "@/components/layout/nav-bar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "HomIllu - Family Hub",
  description: "A collaborative family management and heritage exploration app.",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body min-h-screen bg-background antialiased transition-colors duration-300">
        <FirebaseClientProvider>
          <AuthProvider>
            <I18nProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <div className="relative flex min-h-screen flex-col">
                    <NavBar />
                    <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                      {children}
                    </main>
                  </div>
                  <Toaster />
                </TooltipProvider>
              </ThemeProvider>
            </I18nProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
