
"use client"

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Mail, MapPin, Compass, Github, Twitter, ShieldCheck } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ContactsPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "dhileepudu-hero")?.imageUrl || "https://picsum.photos/seed/dhileepudu/1200/600";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2rem] bg-background/50 backdrop-blur">
        <div className="relative h-[450px] w-full">
          <Image 
            src={heroImage} 
            alt="Dhileepudu" 
            fill 
            className="object-cover"
            priority
            data-ai-hint="man lungi horseback"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8">
            <Badge className="bg-primary/20 text-primary border-primary/20 mb-4 backdrop-blur-md uppercase tracking-[0.3em] px-4 py-1">
              Developer Profile
            </Badge>
            <h1 className="text-6xl font-black tracking-tighter text-foreground">
              Dhileepudu
            </h1>
          </div>
        </div>
        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="grid md:grid-cols-[1fr_250px] gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Compass className="h-8 w-8" />
                Who am I?
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed font-medium text-muted-foreground italic">
                "A South Indian daydreamer in a lungi, trotting through code and countryside on horseback, with a black dog as my QA team."
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                  <MapPin className="h-4 w-4" /> South India
                </Badge>
                <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm">
                  <Heart className="h-4 w-4 text-pink-500" /> Countryside Enthusiast
                </Badge>
              </div>
            </div>

            <div className="space-y-6 bg-secondary/20 p-6 rounded-2xl border border-dashed">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Get in touch</h3>
              <div className="flex flex-col gap-4">
                <a href="mailto:dhileep@homillu.com" className="flex items-center gap-3 text-sm font-semibold hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" /> dhileep@homillu.com
                </a>
                <a href="https://github.com/dhileepudu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-semibold hover:text-primary transition-colors">
                  <Github className="h-5 w-5" /> @dhileepudu
                </a>
                <a href="https://twitter.com/dhileepudu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-semibold hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" /> @dhileepudu
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 opacity-80 pb-12">
        <Card className="bg-card/50 border-muted/50 p-6 flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Code & Lungi</h4>
            <p className="text-xs text-muted-foreground">Merging modern tech stacks with deep-rooted cultural heritage.</p>
          </div>
        </Card>
        <Card className="bg-card/50 border-muted/50 p-6 flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Rural Heart</h4>
            <p className="text-xs text-muted-foreground">Building digital solutions inspired by the simplicity of countryside life.</p>
          </div>
        </Card>
        <Card className="bg-card/50 border-muted/50 p-6 flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Dog Approved</h4>
            <p className="text-xs text-muted-foreground">Ensuring every feature passes the rigorous 'tail-wag' quality check.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
