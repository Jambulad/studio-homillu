
"use client"

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, RefreshCw, Database, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/contacts" className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-4 w-4 text-pink-500 group-hover:scale-125 transition-transform" />
            Developer Profile
          </Link>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            &copy; {new Date().getFullYear()} HomIllu - Family Hub
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-6 p-3 bg-secondary/30 rounded-2xl border border-dashed border-primary/20">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 py-0 h-5 px-1.5 text-[10px]">
                <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin-slow" /> Active
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 py-0 h-5 px-1.5 text-[10px]">
                <Database className="h-2.5 w-2.5 mr-1" /> Synced
              </Badge>
            </div>
          </div>
        )}

        <div className="hidden md:block">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Tradition Meets Technology
          </p>
        </div>
      </div>
    </footer>
  );
}
