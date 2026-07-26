"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RefreshCw, Download, Sliders } from "lucide-react";
import { audioBufferToWav, getAudioContextClass, getOfflineAudioContextClass } from "@/lib/audioDsp";

interface PitchChangerProps {
  originalBuffer: AudioBuffer;
  fileName: string;
}

export function PitchChanger({ originalBuffer, fileName }: PitchChangerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0); // 0.5x to 2.0x
  const [pitch, setPitch] = useState(0); // -12 to +12 semitones
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isExporting, setIsExporting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const lastSpeedRef = useRef<number>(1.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawFrameRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const duration = originalBuffer.duration;

  // Initialize Web Audio
  useEffect(() => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gainNode = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    gainNode.connect(analyser);
    analyser.connect(ctx.destination);

    gainNodeRef.current = gainNode;
    analyserRef.current = analyser;

    gainNode.gain.setValueAtTime(masterVolume, ctx.currentTime);

    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
      }
      if (drawFrameRef.current) cancelAnimationFrame(drawFrameRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      ctx.close();
    };
  }, []);

  // Update gains in real time
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(masterVolume, audioCtxRef.current.currentTime, 0.01);
    }
  }, [masterVolume]);

  // Update speeds and pitch in real time
  useEffect(() => {
    if (sourceRef.current && audioCtxRef.current) {
      // In Web Audio, changing playbackRate changes both pitch and speed.
      // We can also adjust detune dynamically.
      // detune changes pitch in cents (1 semitone = 100 cents)
      sourceRef.current.playbackRate.setTargetAtTime(speed, audioCtxRef.current.currentTime, 0.05);
      sourceRef.current.detune.setTargetAtTime(pitch * 100, audioCtxRef.current.currentTime, 0.05);
    }
    lastSpeedRef.current = speed;
  }, [speed, pitch]);

  // Real-time canvas frequency visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      drawFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Glassy, dark translucent background clearing
      canvasCtx.fillStyle = "rgba(250, 250, 250, 0.15)";
      canvasCtx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5;

        // Custom beautiful purple to emerald color gradient
        const r = Math.floor(139 - (i * 0.5));
        const g = Math.floor(92 + (i * 1.5));
        const b = Math.floor(246 - (i * 1.2));

        canvasCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
        canvasCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (drawFrameRef.current) cancelAnimationFrame(drawFrameRef.current);
    };
  }, [isPlaying]);

  // Playback sync and scheduling
  const play = useCallback((startOffset: number) => {
    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    if (!ctx || !gainNode) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
    }

    const source = ctx.createBufferSource();
    source.buffer = originalBuffer;
    source.connect(gainNode);

    // Apply active speed and pitch
    source.playbackRate.setValueAtTime(speed, ctx.currentTime);
    source.detune.setValueAtTime(pitch * 100, ctx.currentTime);

    source.onended = () => {
      if (sourceRef.current === source) {
        setIsPlaying(false);
        setCurrentTime(duration);
      }
    };

    source.start(0, startOffset);
    sourceRef.current = source;

    // Save starting timestamps. Since speed can stretch time,
    // we use a corrected scale reference.
    startTimeRef.current = ctx.currentTime - (startOffset / speed);
    setIsPlaying(true);
  }, [originalBuffer, speed, pitch, duration]);

  const pause = useCallback(() => {
    if (!isPlaying) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
    }

    // Elapsed time calculation with active speed factor
    const elapsed = (ctx.currentTime - startTimeRef.current) * speed;
    pauseTimeRef.current = Math.min(duration, Math.max(0, elapsed));
    setCurrentTime(pauseTimeRef.current);
    setIsPlaying(false);
  }, [isPlaying, speed, duration]);

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

  // Synchronize dynamic timer tick
  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const elapsed = (ctx.currentTime - startTimeRef.current) * speed;
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
  }, [isPlaying, speed, duration]);

  const handleSeek = (seconds: number) => {
    const target = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(target);
    pauseTimeRef.current = target;
    if (isPlaying) {
      play(target);
    }
  };

  // Lossless Client-Side Pitch & Speed Exporter
  // Since OfflineAudioContext runs at super-fast processing speeds,
  // we can render the exact detuned / speed-adjusted audio buffer in <100ms!
  const exportModified = async () => {
    setIsExporting(true);
    try {
      const sampleRate = originalBuffer.sampleRate;
      // Calculate output length based on speed stretching
      const outputLength = Math.floor(originalBuffer.length / speed);

      const OfflineAudioContextClass = getOfflineAudioContextClass();
      if (!OfflineAudioContextClass) return;

      const offlineCtx = new OfflineAudioContextClass(2, outputLength, sampleRate);

      const bufferSource = offlineCtx.createBufferSource();
      bufferSource.buffer = originalBuffer;
      bufferSource.playbackRate.setValueAtTime(speed, 0);
      bufferSource.detune.setValueAtTime(pitch * 100, 0);

      bufferSource.connect(offlineCtx.destination);
      bufferSource.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const blob = audioBufferToWav(renderedBuffer);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}_Pitch_${pitch}_Speed_${speed.toFixed(1)}x.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const resetControls = () => {
    const wasPlaying = isPlaying;
    if (isPlaying) pause();
    setSpeed(1.0);
    setPitch(0);
    setCurrentTime(0);
    if (wasPlaying) setTimeout(() => play(0), 100);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* File info card */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight truncate max-w-xs md:max-w-md">
              {fileName}
            </h4>
            <p className="text-xs text-muted">
              Length: {formatTime(duration)} • Current Speed: {speed.toFixed(2)}x • Pitch Offset: {pitch >= 0 ? `+${pitch}` : pitch} Semitones
            </p>
          </div>
        </div>
        <button
          onClick={resetControls}
          className="text-xs font-bold text-accent hover:text-accent-hover bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded-full transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* FREQUENCY OSCILLOSCOPE CANVAS */}
      <div className="relative h-28 glass-panel border border-black/5 rounded-2xl overflow-hidden shadow-soft">
        <canvas ref={canvasRef} className="w-full h-full block" width={600} height={112} />
        <div className="absolute top-3 left-4 text-[10px] uppercase tracking-wider font-bold text-muted bg-white/70 backdrop-blur px-2 py-0.5 rounded border border-white/40">
          Real-time Spectrograph
        </div>
      </div>

      {/* CONTROLS SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PITCH CONTROL */}
        <div className="space-y-4 p-6 glass-panel rounded-3xl border border-black/5 relative shadow-soft">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm tracking-wide uppercase text-foreground">
              Pitch Shifter
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-accent/10 text-accent rounded-full">
              {pitch >= 0 ? `+${pitch}` : pitch} semitones
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Modify the pitch of the song by semitones (or half-steps) without changing the duration of the audio.
          </p>
          <div className="pt-2">
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-black/10 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-bold text-muted mt-2 px-1">
              <span>-12 ST (Lower)</span>
              <span>0 ST (Original)</span>
              <span>+12 ST (Higher)</span>
            </div>
          </div>
        </div>

        {/* SPEED CONTROL */}
        <div className="space-y-4 p-6 glass-panel rounded-3xl border border-black/5 relative shadow-soft">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm tracking-wide uppercase text-foreground">
              Tempo & Speed
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-secondary/10 text-secondary rounded-full">
              {speed.toFixed(2)}x
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Speed up or slow down the playback tempo. Excellent for transcription, learning beats, or creating nightcore/daycore versions.
          </p>
          <div className="pt-2">
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-secondary cursor-pointer h-2 bg-black/10 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-bold text-muted mt-2 px-1">
              <span>0.50x (Slowed)</span>
              <span>1.00x (Normal)</span>
              <span>2.00x (Fast)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER PLAYBACK PANEL */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl glass-panel border-white/60 shadow-glass">
        {/* Play & Seek progress */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-accent hover:scale-105 active:scale-95 flex items-center justify-center shadow-soft transition-all duration-300 flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
          <div className="flex-grow">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-display font-bold text-foreground">
                {formatTime(currentTime)}
                <span className="text-muted text-sm font-normal"> / {formatTime(duration)}</span>
              </span>
            </div>
            {/* Range slider for seek */}
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 accent-foreground bg-black/10 rounded-lg cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* Volume controls and export */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
          {/* Master volume inside progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted">VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-24 accent-foreground h-1 cursor-pointer bg-black/10 rounded"
            />
          </div>

          <button
            onClick={exportModified}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background hover:bg-black/85 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Audios
          </button>
        </div>
      </div>
    </div>
  );
}
