"use client";

import Link from "next/link";
import { Music } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex items-center justify-between transition-all duration-500 rounded-full px-6",
          scrolled ? "h-14 glass-panel border border-white/45 shadow-soft" : "h-14 bg-transparent"
        )}>
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
              <div className="w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center">
                <Music className="w-2.5 h-2.5 text-foreground group-hover:text-accent transition-colors" />
              </div>
            </div>
            <span className="font-display font-black text-xl tracking-tight uppercase">
              Vocal<span className="text-accent">Splitter</span>
            </span>
          </Link>

          {/* Desktop Shortcuts Info */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Free Forever</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Client-Side AI</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground" /> Unlimited</span>
          </div>

          {/* Host status badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-secondary bg-secondary/5 text-secondary">
              Self-Host Ready
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
