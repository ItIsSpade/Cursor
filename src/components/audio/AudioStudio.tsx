"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Music,
  Sliders,
  Compass,
  Scissors,
  Mic,
  Trash2,
  Sparkles,
  HelpCircle,
  FileAudio
} from "lucide-react";
import { separateAudio, getAudioContextClass } from "@/lib/audioDsp";

// Modular Tools
import { VocalSplitter } from "./VocalSplitter";
import { PitchChanger } from "./PitchChanger";
import { KeyBPMFinder } from "./KeyBPMFinder";
import { AudioTrimmer } from "./AudioTrimmer";
import { KaraokeRecorder } from "./KaraokeRecorder";

type ActiveTab = "splitter" | "pitch" | "key" | "cutter" | "recorder";

export function AudioStudio() {
  const [fileName, setFileName] = useState<string>("");
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [instrumentalBuffer, setInstrumentalBuffer] = useState<AudioBuffer | null>(null);
  const [vocalsBuffer, setVocalsBuffer] = useState<AudioBuffer | null>(null);

  // App UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("splitter");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger File Input Click
  const onButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drag Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioFile(e.dataTransfer.files[0]);
    }
  };

  // Manual File Select handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAudioFile(e.target.files[0]);
    }
  };

  // Synthesize a beautiful stereo demo track entirely client-side using Web Audio synthesizer!
  // This is a zero-latency, network-independent demo that showcases vocal removal perfectly!
  const loadDemoTrack = () => {
    setIsProcessing(true);
    setFileName("GroovySynthwaveDemo_Synthetic.wav");
    setProcessingStep("Synthesizing Stereo Track...");

    setTimeout(() => {
      try {
        const AudioContextClass = getAudioContextClass();
        if (!AudioContextClass) {
          throw new Error("Web Audio API is not supported in this browser.");
        }
        const ctx = new AudioContextClass();
        const sampleRate = ctx.sampleRate;
        const duration = 12; // 12 seconds
        const length = sampleRate * duration;

        // Create 2-channel stereo audio buffer
        const buffer = ctx.createBuffer(2, length, sampleRate);
        const lChannel = buffer.getChannelData(0);
        const rChannel = buffer.getChannelData(1);

        // Synthesis loop
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;

          // 1. Kick beat (every 0.5s - 120 BPM)
          const beatTime = t % 0.5;
          const kickFreq = 150 * Math.exp(-40 * beatTime);
          const kickEnvelope = Math.exp(-12 * beatTime);
          const kick = kickEnvelope * Math.sin(2 * Math.PI * kickFreq * beatTime) * 0.45;

          // 2. Snare / Clack (every 1.0s, starting offset by 0.5s)
          const snareTime = (t + 0.25) % 0.5;
          const snareEnvelope = Math.exp(-18 * snareTime);
          // Noise signal
          const noise = Math.sin(Math.sin(i * 12345.6789));
          const snare = snareEnvelope * noise * 0.12;

          // 3. Stereo Hi-Hats (every 0.25s) panned left and right
          const hatTime = t % 0.25;
          const hatEnvelope = Math.exp(-45 * hatTime);
          const hatL = hatTime < 0.12 ? hatEnvelope * Math.sin(t * 30000) * 0.04 : 0;
          const hatR = hatTime >= 0.12 ? hatEnvelope * Math.sin(t * 28000) * 0.04 : 0;

          // Backing stereo synthesizer chord pad (Instrumental)
          const synthEnv = 0.15;
          const rootFreq = 110; // A2
          const synthPadL = synthEnv * (
            Math.sin(2 * Math.PI * rootFreq * t) +
            Math.sin(2 * Math.PI * rootFreq * 1.5 * t) // Fifth (E)
          );
          const synthPadR = synthEnv * (
            Math.sin(2 * Math.PI * rootFreq * 1.25 * t) + // Third (C#)
            Math.sin(2 * Math.PI * rootFreq * 2.0 * t) // Octave (A3)
          );

          // 4. "Vocal" center singing melody (pure sine wave playing a catchy vocal scale)
          // Center-panned means identical in L and R!
          let vocalFreq = 440; // A4
          const bar = Math.floor(t);
          if (bar % 4 === 0) vocalFreq = 440; // A
          else if (bar % 4 === 1) vocalFreq = 493.88; // B
          else if (bar % 4 === 2) vocalFreq = 523.25; // C
          else if (bar % 4 === 3) vocalFreq = 587.33; // D

          // Soft vocal singing modulation (Vibrato)
          const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 6.5 * t);
          // Singing envelope with a breathy sound
          const vocalEnv = 0.24 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 1.0 * t));
          const vocalSig = vocalEnv * Math.sin(2 * Math.PI * (vocalFreq * vibrato) * t);

          // Combine channels:
          // Backing tracks (Kick, Snare, Hats, Pads) are the instrumental
          // VocalSig is the center vocal
          lChannel[i] = kick + snare + hatL + synthPadL + vocalSig;
          rChannel[i] = kick + snare + hatR + synthPadR + vocalSig;
        }

        ctx.close();
        processAudioBuffer(buffer);

      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }, 500);
  };

  // Parse dropped file
  const handleAudioFile = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("audio/")) {
      alert("Please upload a valid audio file (.mp3, .wav, .m4a, etc.)");
      return;
    }

    setFileName(selectedFile.name);
    setIsProcessing(true);
    setProcessingStep("Reading Audio File...");

    try {
      const AudioContextClass = getAudioContextClass();
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported in this browser.");
      }
      const ctx = new AudioContextClass();

      // Convert File to ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      setProcessingStep("Decoding Audio Format...");

      // Decode audio frames
      ctx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
        ctx.close();
        processAudioBuffer(decodedBuffer);
      }, (error) => {
        console.error("Audio decoding error: ", error);
        alert("Could not decode audio. Try using standard WAV, MP3, or M4A formats.");
        setIsProcessing(false);
        ctx.close();
      });

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Perform AI Separation & Load Track
  const processAudioBuffer = (buffer: AudioBuffer) => {
    setProcessingStep("Isolating Audio stems (Vocal Extraction)...");

    // Tiny timeout to allow layout rendering
    setTimeout(() => {
      try {
        setOriginalBuffer(buffer);

        // Execute the high-fidelity client separation algorithm!
        const { instrumental, vocals } = separateAudio(buffer);

        setInstrumentalBuffer(instrumental);
        setVocalsBuffer(vocals);
        setActiveTab("splitter"); // default tab
      } catch (err) {
        console.error("DSP processing error: ", err);
      } finally {
        setIsProcessing(false);
      }
    }, 600);
  };

  const handleReset = () => {
    setFileName("");
    setOriginalBuffer(null);
    setInstrumentalBuffer(null);
    setVocalsBuffer(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      {/* HEADER HERO BANNER */}
      <div className="text-center max-w-2xl mx-auto mb-12 mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/10 bg-accent/5 backdrop-blur-md mb-4 text-accent text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> High-Fidelity Client-Side Audio Engine
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight leading-none text-foreground">
          VocalSplitter <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">AI Studio</span>
        </h1>
        <p className="text-sm md:text-base text-muted mt-3 max-w-lg mx-auto leading-relaxed">
          The ultimate music workspace. Extract vocals, change pitch/tempo, cut tracks, record karaoke, and discover keys & BPM. No servers. No limits. 100% Free.
        </p>
      </div>

      {/* NO FILE UPLOADER STATE */}
      {!originalBuffer && !isProcessing && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative max-w-3xl mx-auto p-12 rounded-[2.5rem] border-2 border-dashed text-center transition-all duration-300 shadow-glass glass-panel ${
            dragActive
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-black/10 hover:border-accent/40"
          }`}
        >
          {/* Decorative gradients */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-accent/10 blur-3xl rounded-full -z-10" />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-secondary/10 blur-3xl rounded-full -z-10" />

          <div className="space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto text-accent shadow-soft">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold uppercase text-foreground">Drag & Drop Your Audio File</h3>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Supports MP3, WAV, FLAC, M4A, OGG up to 25MB. All processing is processed locally on your machine for complete security.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={onButtonClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-bold uppercase tracking-wider shadow-soft"
              >
                Browse Local File
              </button>

              <button
                onClick={loadDemoTrack}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-secondary bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" /> Try Synthetic Demo
              </button>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-center items-center gap-1.5 text-xs text-muted font-semibold">
              <HelpCircle className="w-4 h-4" /> Why Client-side? Absolute privacy & zero waiting cues.
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING STATE */}
      {isProcessing && (
        <div className="max-w-md mx-auto text-center p-12 rounded-3xl glass-panel border border-black/5 shadow-glass space-y-6">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent">
              <FileAudio className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-display font-bold text-lg text-foreground uppercase tracking-wider">
              {processingStep}
            </h4>
            <p className="text-xs text-muted">
              Running deep DSP algorithms in-browser. This will take just a few seconds...
            </p>
          </div>
        </div>
      )}

      {/* LOADED STUDIO WORKSPACE */}
      {originalBuffer && instrumentalBuffer && vocalsBuffer && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION CONTROL */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 rounded-3xl glass-panel border border-black/5 shadow-glass space-y-4">
              <div className="text-xs font-black text-muted tracking-widest uppercase">
                Studio Utilities
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: "splitter", label: "Vocal Remover", icon: Music, color: "hover:text-accent" },
                  { id: "pitch", label: "Pitch & Speed", icon: Sliders, color: "hover:text-accent" },
                  { id: "key", label: "Key & BPM Finder", icon: Compass, color: "hover:text-secondary" },
                  { id: "cutter", label: "Audio Cutter", icon: Scissors, color: "hover:text-accent" },
                  { id: "recorder", label: "Karaoke Recording", icon: Mic, color: "hover:text-accent" },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`w-full inline-flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? "bg-foreground text-background scale-[1.02] shadow"
                          : `text-muted hover:bg-black/5 hover:translate-x-1 ${tab.color}`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-black/5">
                <button
                  onClick={handleReset}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <Trash2 className="w-4 h-4" /> Close Active File
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE TOOL STAGE */}
          <div className="lg:col-span-3 p-8 rounded-3xl glass-panel border-white/60 shadow-glass">
            {activeTab === "splitter" && (
              <VocalSplitter
                originalBuffer={originalBuffer}
                instrumentalBuffer={instrumentalBuffer}
                vocalsBuffer={vocalsBuffer}
                fileName={fileName}
              />
            )}

            {activeTab === "pitch" && (
              <PitchChanger
                originalBuffer={originalBuffer}
                fileName={fileName}
              />
            )}

            {activeTab === "key" && (
              <KeyBPMFinder
                originalBuffer={originalBuffer}
                fileName={fileName}
              />
            )}

            {activeTab === "cutter" && (
              <AudioTrimmer
                originalBuffer={originalBuffer}
                fileName={fileName}
              />
            )}

            {activeTab === "recorder" && (
              <KaraokeRecorder
                instrumentalBuffer={instrumentalBuffer}
                fileName={fileName}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
