"use client"

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { 
  Globe, 
  LayoutDashboard, 
  CheckSquare, 
  ShoppingBag, 
  Calendar, 
  GitBranch, 
  Clock, 
  Moon, 
  Sun, 
  LogOut, 
  User as UserIcon,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function NavBar() {
  const { t, i18n } = useTranslation();
  const { setLanguage, theme, toggleTheme, user, signIn, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (lang: "en" | "te") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const navItems = [
    { href: "/", label: t("common.dashboard"), icon: LayoutDashboard },
    { href: "/tasks", label: t("nav.tasks"), icon: CheckSquare },
    { href: "/shopping", label: t("nav.shopping"), icon: ShoppingBag },
    { href: "/calendar", label: t("nav.calendar"), icon: Calendar },
    { href: "/family-tree", label: t("nav.tree"), icon: GitBranch },
    { href: "/moments", label: t("nav.moments"), icon: Clock },
    { href: "/lunar", label: t("nav.lunar"), icon: Moon },
  ];

  const appName = i18n.language === "te" ? "హోమిల్లు" : "HomIllu";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold text-primary text-2xl">
                    {appName}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-2 py-3 text-lg font-medium text-muted-foreground transition-colors hover:text-primary rounded-lg hover:bg-secondary/50"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="flex items-center space-x-2 font-headline text-2xl font-bold text-primary">
            <span>{appName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <Globe className="h-4 w-4" />
                {i18n.language === "en" ? "English" : "తెలుగు"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => lang === "te" ? changeLanguage("te") : changeLanguage("te")}>
                తెలుగు
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-primary/10">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{i18n.language === "te" ? "లాగ్ అవుట్" : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signIn} size="sm" className="shadow-sm">
              {i18n.language === "te" ? "ప్రవేశించు" : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
