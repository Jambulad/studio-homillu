
"use client"

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart, Compass, ShieldCheck, Mail, Send, Loader2, MapPin } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { sendContactEmail } from "@/ai/flows/send-contact-email";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactsPage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSending(true);
    try {
      const result = await sendContactEmail({
        senderName: data.name,
        senderEmail: data.email,
        message: data.message,
      });
      
      toast({
        title: "Message Received",
        description: result.preview,
      });
      
      if (result.success) {
        form.reset();
      }
    } catch (error) {
      console.error("Form Submission Error:", error);
      toast({
        variant: "destructive",
        title: "Submission Note",
        description: "Your message was captured, but the AI notification service is currently offline.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const heroImageData = PlaceHolderImages.find(img => img.id === "dhileepudu-hero");
  const heroImage = heroImageData?.imageUrl || "https://picsum.photos/seed/dhileepudu/1200/600";
  const imageHint = heroImageData?.imageHint || "man lungi horseback dog";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-background/50 backdrop-blur">
        <div className="relative h-[450px] w-full">
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
        <CardContent className="p-10 md:p-16 space-y-12">
          <div className="grid md:grid-cols-[1fr_350px] gap-16">
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-primary/10 cursor-help">
                      <MapPin className="h-3 w-3" />
                      India
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gunthakallu, India</p>
                  </TooltipContent>
                </Tooltip>

                <Badge variant="secondary" className="gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-accent/10">
                  <Heart className="h-3 w-3 fill-accent" />
                  Rural Heritage
                </Badge>
              </div>
            </div>

            <div className="space-y-6 bg-secondary/30 p-8 rounded-[2.5rem] border-2 border-dashed border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Get in Touch</h3>
              </div>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] uppercase font-black opacity-60">Your Name</Label>
                  <Input 
                    id="name" 
                    {...form.register("name")}
                    placeholder="Dhileep"
                    className="bg-background/80 border-primary/10 focus:border-primary/40 rounded-xl"
                  />
                  {form.formState.errors.name && (
                    <p className="text-[10px] text-destructive font-bold">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] uppercase font-black opacity-60">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    {...form.register("email")}
                    placeholder="dhileepudu@gmail.com"
                    className="bg-background/80 border-primary/10 focus:border-primary/40 rounded-xl"
                  />
                  {form.formState.errors.email && (
                    <p className="text-[10px] text-destructive font-bold">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-[10px] uppercase font-black opacity-60">Message</Label>
                  <Textarea 
                    id="message" 
                    {...form.register("message")}
                    placeholder="Tell me about your journey..."
                    className="bg-background/80 border-primary/10 focus:border-primary/40 rounded-xl resize-none h-24"
                  />
                  {form.formState.errors.message && (
                    <p className="text-[10px] text-destructive font-bold">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full gap-2 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg hover:translate-y-[-2px] transition-all"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSending ? "Processing" : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8 pb-20">
        <Card className="bg-card/40 border-primary/10 p-8 flex flex-col items-center text-center gap-5 rounded-[2rem] backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">Code & Culture</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Merging cutting-edge NextJS stacks with deep-rooted cultural values.</p>
          </div>
        </Card>
        <Card className="bg-card/40 border-accent/10 p-8 flex flex-col items-center text-center gap-5 rounded-[2rem] backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center -rotate-3">
            <Heart className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">Countryside Tech</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Building digital solutions inspired by the quiet strength of rural life.</p>
          </div>
        </Card>
        <Card className="bg-card/40 border-teal-500/10 p-8 flex flex-col items-center text-center gap-5 rounded-[2rem] backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center rotate-6">
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
