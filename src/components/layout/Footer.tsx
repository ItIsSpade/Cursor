import Link from "next/link";
import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
             <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                <div className="w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center">
                  <Music className="w-2.5 h-2.5 text-foreground group-hover:text-accent transition-colors" />
                </div>
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-foreground uppercase">
                Vocal<span className="text-accent">Splitter</span>
              </span>
            </Link>
            <p className="text-muted text-sm max-w-sm mt-4 leading-relaxed">
              A state-of-the-art client-side audio processor and vocal extraction workspace. Zero server overhead, 100% free, private, and hostable with no limits.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-6">Tools</h3>
            <ul className="space-y-4 text-sm font-medium text-muted">
              <li>Vocal Remover</li>
              <li>Pitch & Tempo Changer</li>
              <li>Key & BPM Finder</li>
              <li>Audio Cutter & Trimmer</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-6">Host Status</h3>
            <ul className="space-y-4">
              <li>
                <span className="text-xs font-bold text-secondary bg-secondary/5 border border-secondary/10 px-2 py-1 rounded-full">
                  100% Free Self-Host
                </span>
              </li>
              <li>
                <span className="text-xs font-bold text-accent bg-accent/5 border border-accent/10 px-2 py-1 rounded-full">
                  Client-side Audio DSP
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} VocalSplitter Studio. All rights reserved. Locally processed with browser-level security.
          </p>
          <div className="flex space-x-6">
            <span className="text-xs font-bold text-muted uppercase">Designed for Independence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
