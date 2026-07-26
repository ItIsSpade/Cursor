"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, Download, RefreshCw, Music, Mic } from "lucide-react";
import { audioBufferToWav, getAudioContextClass } from "@/lib/audioDsp";

interface VocalSplitterProps {
  originalBuffer: AudioBuffer;
  instrumentalBuffer: AudioBuffer;
  vocalsBuffer: AudioBuffer;
  fileName: string;
}

export function VocalSplitter({
  originalBuffer,
  instrumentalBuffer,
  vocalsBuffer,
  fileName,
}: VocalSplitterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [vocalVolume, setVocalVolume] = useState(1.0);
  const [instVolume, setInstVolume] = useState(1.0);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isVocalMuted, setIsVocalMuted] = useState(false);
  const [isInstMuted, setIsInstMuted] = useState(false);
  const [isVocalSolo, setIsVocalSolo] = useState(false);
  const [isInstSolo, setIsInstSolo] = useState(false);

  const [isExportingVocals, setIsExportingVocals] = useState(false);
  const [isExportingInst, setIsExportingInst] = useState(false);
  const [isExportingMix, setIsExportingMix] = useState(false);

  // Audio Context & Node References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const instSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const vocSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const instGainRef = useRef<GainNode | null>(null);
  const vocGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Timing references
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Canvas Waveform References
  const instCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vocCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const duration = originalBuffer.duration;

  // Initialize Audio Nodes
  useEffect(() => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Create Gain Nodes
    const instGain = ctx.createGain();
    const vocGain = ctx.createGain();
    const masterGain = ctx.createGain();

    // Connect gains
    instGain.connect(masterGain);
    vocGain.connect(masterGain);
    masterGain.connect(ctx.destination);

    instGainRef.current = instGain;
    vocGainRef.current = vocGain;
    masterGainRef.current = masterGain;

    // Set initial volumes
    instGain.gain.setValueAtTime(instVolume, ctx.currentTime);
    vocGain.gain.setValueAtTime(vocalVolume, ctx.currentTime);
    masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);

    return () => {
      // Cleanup playback on unmount
      if (instSourceRef.current) {
        try { instSourceRef.current.stop(); } catch {}
      }
      if (vocSourceRef.current) {
        try { vocSourceRef.current.stop(); } catch {}
      }
      ctx.close();
    };
  }, []);

  // Update Volumes and Solo/Mute State
  useEffect(() => {
    if (!instGainRef.current || !vocGainRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    let targetInstVol = isInstMuted ? 0 : instVolume;
    let targetVocVol = isVocalMuted ? 0 : vocalVolume;

    // Apply Solo Override
    if (isInstSolo) {
      targetVocVol = 0;
    } else if (isVocalSolo) {
      targetInstVol = 0;
    }

    instGainRef.current.gain.setTargetAtTime(targetInstVol, ctx.currentTime, 0.01);
    vocGainRef.current.gain.setTargetAtTime(targetVocVol, ctx.currentTime, 0.01);
    masterGainRef.current.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.01);
  }, [vocalVolume, instVolume, masterVolume, isVocalMuted, isInstMuted, isVocalSolo, isInstSolo]);

  // Start Playback
  const play = useCallback((startOffset: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !instGainRef.current || !vocGainRef.current) return;

    // Resume AudioContext if suspended (browser security)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Stop current sources if active
    if (instSourceRef.current) {
      try { instSourceRef.current.stop(); } catch {}
    }
    if (vocSourceRef.current) {
      try { vocSourceRef.current.stop(); } catch {}
    }

    // Create Sources
    const instSource = ctx.createBufferSource();
    instSource.buffer = instrumentalBuffer;
    instSource.connect(instGainRef.current);

    const vocSource = ctx.createBufferSource();
    vocSource.buffer = vocalsBuffer;
    vocSource.connect(vocGainRef.current);

    // Setup loop completion
    instSource.onended = () => {
      // Only reset play states if this is indeed the active playback source finishing
      if (instSourceRef.current === instSource) {
        setIsPlaying(false);
        setCurrentTime(duration);
      }
    };

    // Play synced
    instSource.start(0, startOffset);
    vocSource.start(0, startOffset);

    instSourceRef.current = instSource;
    vocSourceRef.current = vocSource;

    startTimeRef.current = ctx.currentTime - startOffset;
    setIsPlaying(true);
  }, [instrumentalBuffer, vocalsBuffer, duration]);

  // Pause Playback
  const pause = useCallback(() => {
    if (!isPlaying) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (instSourceRef.current) {
      try { instSourceRef.current.stop(); } catch {}
    }
    if (vocSourceRef.current) {
      try { vocSourceRef.current.stop(); } catch {}
    }

    pauseTimeRef.current = ctx.currentTime - startTimeRef.current;
    setCurrentTime(pauseTimeRef.current);
    setIsPlaying(false);
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      let offset = currentTime;
      if (offset >= duration) {
        offset = 0;
        setCurrentTime(0);
      }
      play(offset);
    }
  };

  const handleSeek = (seconds: number) => {
    const target = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(target);
    pauseTimeRef.current = target;
    if (isPlaying) {
      play(target);
    }
  };

  // Live timer tick
  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const elapsed = ctx.currentTime - startTimeRef.current;
      if (elapsed >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
      } else {
        setCurrentTime(elapsed);
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, duration]);

  // Render Waveform Helper
  const drawWaveform = (
    canvas: HTMLCanvasElement,
    buffer: AudioBuffer,
    colorFrom: string,
    colorTo: string,
    currentProgress: number
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const leftData = buffer.getChannelData(0);
    const step = Math.ceil(leftData.length / width);
    const amp = height / 2;

    const progressLimit = Math.floor(currentProgress * width);

    // Create Gradient
    const gradientActive = ctx.createLinearGradient(0, 0, 0, height);
    gradientActive.addColorStop(0, colorFrom);
    gradientActive.addColorStop(1, colorTo);

    ctx.fillStyle = "#E4E4E7"; // Unplayed background bars

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = leftData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      // Ensure some visibility
      if (max - min < 0.05) {
        max = 0.025;
        min = -0.025;
      }

      const y1 = (1 + min) * amp;
      const y2 = (1 + max) * amp;
      const barHeight = Math.max(2, y2 - y1);

      // Color based on play progress
      if (i < progressLimit) {
        ctx.fillStyle = gradientActive;
      } else {
        ctx.fillStyle = "#E4E4E7";
      }

      ctx.fillRect(i, y1, 1.5, barHeight);
    }
  };

  // Re-draw waveforms when currentTime changes or on mount
  useEffect(() => {
    if (instCanvasRef.current) {
      drawWaveform(
        instCanvasRef.current,
        instrumentalBuffer,
        "#10B981",
        "#059669",
        currentTime / duration
      );
    }
    if (vocCanvasRef.current) {
      drawWaveform(
        vocCanvasRef.current,
        vocalsBuffer,
        "#8B5CF6",
        "#7C3AED",
        currentTime / duration
      );
    }
  }, [currentTime, duration, instrumentalBuffer, vocalsBuffer]);

  // Handle canvas click to seek
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    handleSeek(percentage * duration);
  };

  // Format Time (mm:ss)
  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Export Instrumentals
  const exportInstrumental = async () => {
    setIsExportingInst(true);
    try {
      const blob = audioBufferToWav(instrumentalBuffer);
      triggerDownload(blob, `${fileName.replace(/\.[^/.]+$/, "")}_Instrumental.wav`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingInst(false);
    }
  };

  // Export Vocals
  const exportVocals = async () => {
    setIsExportingVocals(true);
    try {
      const blob = audioBufferToWav(vocalsBuffer);
      triggerDownload(blob, `${fileName.replace(/\.[^/.]+$/, "")}_Vocals.wav`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingVocals(false);
    }
  };

  // Export Mix
  const exportMix = async () => {
    setIsExportingMix(true);
    try {
      const ctx = audioCtxRef.current || new AudioContext();
      const length = originalBuffer.length;
      const sampleRate = originalBuffer.sampleRate;

      const mixBuffer = ctx.createBuffer(2, length, sampleRate);
      const mixL = mixBuffer.getChannelData(0);
      const mixR = mixBuffer.getChannelData(1);

      const instL = instrumentalBuffer.getChannelData(0);
      const instR = instrumentalBuffer.numberOfChannels > 1 ? instrumentalBuffer.getChannelData(1) : instL;
      const vocL = vocalsBuffer.getChannelData(0);
      const vocR = vocalsBuffer.numberOfChannels > 1 ? vocalsBuffer.getChannelData(1) : vocL;

      const actInstVol = isInstMuted ? 0 : (isVocalSolo ? 0 : instVolume);
      const actVocVol = isVocalMuted ? 0 : (isInstSolo ? 0 : vocalVolume);

      // Simple sum mixing
      for (let i = 0; i < length; i++) {
        mixL[i] = instL[i] * actInstVol + vocL[i] * actVocVol;
        mixR[i] = instR[i] * actInstVol + vocR[i] * actVocVol;
      }

      const blob = audioBufferToWav(mixBuffer);
      triggerDownload(blob, `${fileName.replace(/\.[^/.]+$/, "")}_CustomMix.wav`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingMix(false);
    }
  };

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* File Info Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight truncate max-w-xs md:max-w-md">
              {fileName}
            </h4>
            <p className="text-xs text-muted">
              Length: {formatTime(duration)} • Ready for Real-Time Separation
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-secondary/10 text-secondary rounded-full">
          100% Client AI DSP
        </div>
      </div>

      {/* WAVEFORMS SECTION */}
      <div className="space-y-6">
        {/* INSTRUMENTAL WAVEFORM */}
        <div className="space-y-2 relative group">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold tracking-wider uppercase text-secondary flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Instrumental Track
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsInstMuted(!isInstMuted)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${
                  isInstMuted
                    ? "bg-red-500/10 text-red-500"
                    : "bg-black/5 hover:bg-black/10 text-muted"
                }`}
              >
                Mute
              </button>
              <button
                onClick={() => {
                  setIsInstSolo(!isInstSolo);
                  setIsVocalSolo(false);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${
                  isInstSolo
                    ? "bg-secondary text-white"
                    : "bg-black/5 hover:bg-black/10 text-muted"
                }`}
              >
                Solo
              </button>
            </div>
          </div>
          <div className="relative h-28 glass-panel border border-black/5 rounded-2xl overflow-hidden cursor-pointer shadow-soft">
            <canvas
              ref={instCanvasRef}
              width={800}
              height={112}
              onClick={handleCanvasClick}
              className="w-full h-full block"
            />
            {/* Real-time slider overlay inside waveform for aesthetics */}
            <div className="absolute right-4 bottom-3 opacity-85 hover:opacity-100 transition-opacity bg-white/95 backdrop-blur border border-black/5 rounded-xl px-3 py-1.5 shadow flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-secondary" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={instVolume}
                onChange={(e) => setInstVolume(parseFloat(e.target.value))}
                className="w-20 accent-secondary h-1 cursor-pointer"
              />
              <span className="text-[10px] font-bold text-foreground w-6 text-right">
                {Math.round(instVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* VOCALS WAVEFORM */}
        <div className="space-y-2 relative group">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold tracking-wider uppercase text-accent flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" /> Vocal Track (Isolated)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVocalMuted(!isVocalMuted)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${
                  isVocalMuted
                    ? "bg-red-500/10 text-red-500"
                    : "bg-black/5 hover:bg-black/10 text-muted"
                }`}
              >
                Mute
              </button>
              <button
                onClick={() => {
                  setIsVocalSolo(!isVocalSolo);
                  setIsInstSolo(false);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase transition-colors ${
                  isVocalSolo
                    ? "bg-accent text-white"
                    : "bg-black/5 hover:bg-black/10 text-muted"
                }`}
              >
                Solo
              </button>
            </div>
          </div>
          <div className="relative h-28 glass-panel border border-black/5 rounded-2xl overflow-hidden cursor-pointer shadow-soft">
            <canvas
              ref={vocCanvasRef}
              width={800}
              height={112}
              onClick={handleCanvasClick}
              className="w-full h-full block"
            />
            {/* Real-time volume slider inside waveform */}
            <div className="absolute right-4 bottom-3 opacity-85 hover:opacity-100 transition-opacity bg-white/95 backdrop-blur border border-black/5 rounded-xl px-3 py-1.5 shadow flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-accent" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={vocalVolume}
                onChange={(e) => setVocalVolume(parseFloat(e.target.value))}
                className="w-20 accent-accent h-1 cursor-pointer"
              />
              <span className="text-[10px] font-bold text-foreground w-6 text-right">
                {Math.round(vocalVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl glass-panel border-white/60 shadow-glass">
        {/* Play & Time Indicator */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-accent hover:scale-105 active:scale-95 flex items-center justify-center shadow-soft transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
          <div>
            <div className="text-xl font-display font-bold tracking-tight">
              {formatTime(currentTime)}
              <span className="text-muted text-sm font-normal"> / {formatTime(duration)}</span>
            </div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted">
              Real-time seek enabled
            </p>
          </div>
        </div>

        {/* Master Control Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Volume2 className="w-5 h-5 text-muted" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="w-full md:w-44 accent-foreground h-1.5 cursor-pointer bg-black/10 rounded-lg"
          />
          <span className="text-xs font-bold text-muted w-10">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>

        {/* Download / Export Dropdown */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={exportInstrumental}
            disabled={isExportingInst}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-secondary bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {isExportingInst ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Instrumental
          </button>

          <button
            onClick={exportVocals}
            disabled={isExportingVocals}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-accent bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {isExportingVocals ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Vocals
          </button>

          <button
            onClick={exportMix}
            disabled={isExportingMix}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background hover:bg-black/85 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {isExportingMix ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Custom Mix
          </button>
        </div>
      </div>
    </div>
  );
}
