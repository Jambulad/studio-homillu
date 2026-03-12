
"use client"

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Mail, MapPin, Compass, Github, Twitter, ShieldCheck } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ContactsPage() {
  const heroImageData = PlaceHolderImages.find(img => img.id === "dhileepudu-hero");
  const heroImage = heroImageData?.imageUrl || "https://picsum.photos/seed/dhileepudu/1200/600";
  const imageHint = heroImageData?.imageHint || "man lungi horseback dog";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-background/50 backdrop-blur">
        <div className="relative h-[500px] w-full">
          <Image 
            src={heroImage} 
            alt="Dhileepudu" 
            fill 
            className="object-cover"
            priority
            data-ai-hint={imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <Badge className="bg-primary/20 text-primary border-primary/20 mb-4 backdrop-blur-md uppercase tracking-[0.4em] px-5 py-1.5 text-[10px] font-black">
              Lead Architect & Daydreamer
            </Badge>
            <h1 className="text-7xl font-black tracking-tighter text-foreground drop-shadow-sm">
              Dhileepudu
            </h1>
          </div>
        </div>
        <CardContent className="p-10 md:p-16 space-y-10">
          <div className="grid md:grid-cols-[1fr_300px] gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-primary flex items-center gap-4 tracking-tighter">
                  <Compass className="h-10 w-10" />
                  The Journey
                </h2>
                <p className="text-2xl md:text-3xl leading-snug font-medium text-muted-foreground italic serif">
                  "A South Indian daydreamer in a lungi, trotting through code and countryside on horseback, with a black dog as my QA team."
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-primary/10">
                  <MapPin className="h-4 w-4 text-primary" /> South India
                </Badge>
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-accent/10">
                  <Heart className="h-4 w-4 text-pink-500" /> Rural Heritage
                </Badge>
              </div>
            </div>

            <div className="space-y-8 bg-secondary/30 p-8 rounded-[2rem] border-2 border-dashed border-primary/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Connect Digitally</h3>
              <div className="flex flex-col gap-6">
                <a href="mailto:dhileep@homillu.com" className="flex items-center gap-4 text-sm font-bold hover:text-primary transition-all hover:translate-x-1 group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  dhileep@homillu.com
                </a>
                <a href="https://github.com/dhileepudu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-sm font-bold hover:text-primary transition-all hover:translate-x-1 group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  @dhileepudu
                </a>
                <a href="https://twitter.com/dhileepudu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-sm font-bold hover:text-primary transition-all hover:translate-x-1 group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  @dhileepudu
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8 pb-20">
        <Card className="bg-card/40 border-primary/10 p-8 flex flex-col items-center text-center gap-5 rounded-[2rem] backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">Code & Culture</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Merging cutting-edge NextJS stacks with deep-rooted cultural values.</p>
          </div>
        </Card>
        <Card className="bg-card/40 border-accent/10 p-8 flex flex-col items-center text-center gap-5 rounded-[2rem] backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
            <Heart className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">Countryside Tech</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Building digital solutions inspired by the quiet strength of rural life.</p>
          </div>
        </Card>
        <Card className="bg-card/40 border-teal-500/10 p-8 flex flex-col items-center text-center gap-5 rounded-[2rem] backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform">
            <ShieldCheck className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">QA Approved</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Every feature is rigorously tested by the finest black dog in South India.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
