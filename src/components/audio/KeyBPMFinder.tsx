"use client";

import { useEffect, useState } from "react";
import { Music, Activity, Compass, Sparkles } from "lucide-react";
import { detectBPM, detectKey } from "@/lib/audioDsp";

interface KeyBPMFinderProps {
  originalBuffer: AudioBuffer;
  fileName: string;
}

export function KeyBPMFinder({ originalBuffer, fileName }: KeyBPMFinderProps) {
  const [bpm, setBpm] = useState<number | null>(null);
  const [keyInfo, setKeyInfo] = useState<{ key: string; camelot: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Run the DSP analysis on mount
  useEffect(() => {
    setIsAnalyzing(true);
    // Wrap in a tiny timeout to let the UI render the loading state first
    const timer = setTimeout(() => {
      try {
        const detectedBpm = detectBPM(originalBuffer);
        const detectedKey = detectKey(originalBuffer);
        setBpm(detectedBpm);
        setKeyInfo(detectedKey);
      } catch (err) {
        console.error("Analysis error: ", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [originalBuffer]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="text-center">
          <h3 className="font-display font-bold text-lg">Analyzing Harmonical Structure...</h3>
          <p className="text-xs text-muted">Running FFT and Autocorrelation DSP in your browser</p>
        </div>
      </div>
    );
  }

  // Compatible harmonic keys based on Camelot Wheel
  const getCompatibleKeys = (camelot: string) => {
    const num = parseInt(camelot);
    const letter = camelot.replace(/[0-9]/g, ""); // "A" or "B"
    const oppLetter = letter === "A" ? "B" : "A";

    // Standard Camelot rules:
    // 1. Same number, opposite letter (Relative Major/Minor): e.g. 8A <-> 8B
    // 2. Add 1 or Subtract 1, same letter: e.g. 8A <-> 7A, 9A
    const sameNumOppLetter = `${num}${oppLetter}`;
    const minusOne = `${num === 1 ? 12 : num - 1}${letter}`;
    const plusOne = `${num === 12 ? 1 : num + 1}${letter}`;

    const keyMap: { [key: string]: string } = {
      "1A": "A-flat Minor", "2A": "E-flat Minor", "3A": "B-flat Minor", "4A": "F Minor", "5A": "C Minor", "6A": "G Minor",
      "7A": "D Minor", "8A": "A Minor", "9A": "E Minor", "10A": "B Minor", "11A": "F-sharp Minor", "12A": "C-sharp Minor",
      "1B": "B Major", "2B": "F-sharp Major", "3B": "D-flat Major", "4B": "A-flat Major", "5B": "E-flat Major", "6B": "B-flat Major",
      "7B": "F Major", "8B": "C Major", "9B": "G Major", "10B": "D Major", "11B": "A Major", "12B": "E Major"
    };

    return [
      { code: minusOne, name: keyMap[minusOne], type: "Subdominant (Minus 1)" },
      { code: plusOne, name: keyMap[plusOne], type: "Dominant (Plus 1)" },
      { code: sameNumOppLetter, name: keyMap[sameNumOppLetter], type: "Relative Key (Letter Shift)" }
    ];
  };

  const compatibles = keyInfo ? getCompatibleKeys(keyInfo.camelot) : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight truncate max-w-xs md:max-w-md">
              {fileName}
            </h4>
            <p className="text-xs text-muted">
              Acoustic analysis completed • High precision profile matching
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-accent/10 text-accent rounded-full animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Analytically Tuned
        </span>
      </div>

      {/* DETECTED VALUES CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BPM CONTAINER */}
        <div className="p-8 rounded-3xl glass-panel border-white/60 shadow-glass flex flex-col justify-between items-center text-center relative overflow-hidden group">
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-wider font-bold text-muted flex items-center gap-1">
            <Activity className="w-3 h-3 text-secondary animate-pulse" /> Beats Per Minute
          </div>

          <div className="my-6">
            <div
              style={{ animationDuration: bpm ? `${60 / bpm}s` : "0.5s" }}
              className="w-32 h-32 rounded-full bg-secondary/10 flex items-center justify-center border-4 border-secondary/20 animate-pulse relative"
            >
              <div className="text-5xl font-display font-extrabold text-secondary tracking-tighter">
                {bpm || "—"}
              </div>
              <div className="absolute -bottom-2 px-3 py-0.5 bg-secondary text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                TEMPO
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-base tracking-tight uppercase">BPM Speed Meter</h5>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              Tempo matches standard rhythms. The visual pulse beats in exact sync with the song&apos;s discovered BPM.
            </p>
          </div>
        </div>

        {/* KEY & CAMELOT CONTAINER */}
        <div className="p-8 rounded-3xl glass-panel border-white/60 shadow-glass flex flex-col justify-between items-center text-center relative overflow-hidden group">
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-wider font-bold text-muted flex items-center gap-1">
            <Music className="w-3 h-3 text-accent" /> Harmonic Key
          </div>

          <div className="my-6 flex gap-4 items-center">
            {/* Camelot Code Card */}
            <div className="w-24 h-24 rounded-2xl bg-accent text-white flex flex-col items-center justify-center shadow-soft transform group-hover:scale-105 transition-transform">
              <span className="text-4xl font-display font-black leading-none">{keyInfo?.camelot || "—"}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">CAMELOT</span>
            </div>
            {/* Standard Key Card */}
            <div className="text-left">
              <div className="text-2xl font-display font-bold text-foreground">
                {keyInfo?.key || "—"}
              </div>
              <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest">
                Musical Scale
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-base tracking-tight uppercase">Tone Key Matcher</h5>
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              Discovered key matched using standard musical Krumhansl-Schmuckler profiles for harmonic compatibility.
            </p>
          </div>
        </div>
      </div>

      {/* COMPATIBLE HARMONIC KEYS LIST */}
      <div className="p-6 rounded-3xl glass-panel border-white/60 shadow-glass space-y-4">
        <div>
          <h4 className="font-bold text-sm tracking-wide uppercase text-foreground flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent animate-spin-slow" /> Harmonic Compatibility (For DJs & Mashups)
          </h4>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Harmonic mixing lets you blend songs without key clashes. Choose tracks matching these compatible keys for smooth transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {compatibles.map((compat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-black/5 bg-black/5 flex items-center justify-between hover:bg-black/10 transition-colors"
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted block">
                  {compat.type}
                </span>
                <span className="font-bold text-sm text-foreground block mt-1">
                  {compat.name}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft border border-black/5 text-accent font-display font-black text-sm">
                {compat.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
