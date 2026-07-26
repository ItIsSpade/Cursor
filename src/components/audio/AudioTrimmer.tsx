"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Scissors, RefreshCw, RotateCcw } from "lucide-react";
import { audioBufferToWav, getAudioContextClass, getOfflineAudioContextClass } from "@/lib/audioDsp";

interface AudioTrimmerProps {
  originalBuffer: AudioBuffer;
  fileName: string;
}

export function AudioTrimmer({ originalBuffer, fileName }: AudioTrimmerProps) {
  const duration = originalBuffer.duration;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Trim States
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);
  const [fadeIn, setFadeIn] = useState(0); // in seconds
  const [fadeOut, setFadeOut] = useState(0); // in seconds
  const [isLooping, setIsLooping] = useState(true);

  const [isExporting, setIsExporting] = useState(false);

  // Refs for Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Refs for Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synchronous play scheduler
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

    source.onended = () => {
      if (sourceRef.current === source && !isLooping) {
        setIsPlaying(false);
      }
    };

    // Play only starting at offset
    const validOffset = Math.max(startTime, Math.min(endTime, startOffset));
    const durationToPlay = Math.max(0, endTime - validOffset);

    source.start(0, validOffset, durationToPlay);
    sourceRef.current = source;

    startTimeRef.current = ctx.currentTime - (validOffset - startTime);
    setCurrentTime(validOffset);
    setIsPlaying(true);
  }, [originalBuffer, startTime, endTime, isLooping]);

  // Initialize Web Audio context
  useEffect(() => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ctx.close();
    };
  }, []);

  // Sync end time on duration change
  useEffect(() => {
    setEndTime(duration);
  }, [duration]);

  // Handle Playback Loop bounds
  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const elapsed = ctx.currentTime - startTimeRef.current + startTime;

      if (elapsed >= endTime) {
        if (isLooping) {
          // Loop back to start
          play(startTime);
        } else {
          setCurrentTime(endTime);
          setIsPlaying(false);
        }
      } else {
        setCurrentTime(elapsed);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, startTime, endTime, isLooping, play]);

  const pause = useCallback(() => {
    if (!isPlaying) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
    }

    const elapsed = ctx.currentTime - startTimeRef.current + startTime;
    pauseTimeRef.current = Math.max(startTime, Math.min(endTime, elapsed));
    setCurrentTime(pauseTimeRef.current);
    setIsPlaying(false);
  }, [isPlaying, startTime, endTime]);

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      let offset = currentTime;
      if (offset >= endTime || offset < startTime) {
        offset = startTime;
      }
      play(offset);
    }
  };

  // Render Visual Timeline Waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const leftData = originalBuffer.getChannelData(0);
    const step = Math.ceil(leftData.length / width);
    const amp = height / 2;

    const startX = Math.floor((startTime / duration) * width);
    const endX = Math.floor((endTime / duration) * width);
    const cursorX = Math.floor((currentTime / duration) * width);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = leftData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const y1 = (1 + min) * amp;
      const y2 = (1 + max) * amp;
      const barHeight = Math.max(2, y2 - y1);

      // Determine colors based on active selection bounds
      if (i >= startX && i <= endX) {
        // Highlight active trim window
        ctx.fillStyle = "rgba(139, 92, 246, 0.75)"; // Highlight color
      } else {
        ctx.fillStyle = "rgba(228, 228, 231, 0.6)"; // Muted gray for cropped out
      }

      ctx.fillRect(i, y1, 1.5, barHeight);
    }

    // Draw bounds handles
    ctx.fillStyle = "#8B5CF6"; // Purple boundary lines
    ctx.fillRect(startX, 0, 2, height);
    ctx.fillStyle = "#10B981"; // Emerald boundary lines
    ctx.fillRect(endX, 0, 2, height);

    // Draw active playhead
    if (isPlaying || currentTime > startTime) {
      ctx.fillStyle = "#18181B";
      ctx.fillRect(cursorX, 0, 1.5, height);
    }
  }, [originalBuffer, startTime, endTime, currentTime, duration, isPlaying]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Click Timeline to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = clickX / rect.width;
    const clickTime = clickPercentage * duration;

    // Constrain playhead seek inside selected clip range
    const validSeek = Math.max(startTime, Math.min(endTime, clickTime));
    setCurrentTime(validSeek);
    if (isPlaying) {
      play(validSeek);
    }
  };

  // Export precise WAV with Fade Filters
  const exportTrimmed = async () => {
    setIsExporting(true);
    try {
      const sampleRate = originalBuffer.sampleRate;

      // Calculate output frame length
      const startFrame = Math.floor(startTime * sampleRate);
      const endFrame = Math.floor(endTime * sampleRate);
      const clipLength = endFrame - startFrame;

      if (clipLength <= 0) return;

      const OfflineAudioContextClass = getOfflineAudioContextClass();
      if (!OfflineAudioContextClass) return;

      const offlineCtx = new OfflineAudioContextClass(2, clipLength, sampleRate);

      const bufferSource = offlineCtx.createBufferSource();
      bufferSource.buffer = originalBuffer;

      // Gain node for fade filters
      const offlineGain = offlineCtx.createGain();

      // Connect nodes
      bufferSource.connect(offlineGain);
      offlineGain.connect(offlineCtx.destination);

      // Configure Fade-In envelope
      if (fadeIn > 0) {
        offlineGain.gain.setValueAtTime(0, 0);
        offlineGain.gain.linearRampToValueAtTime(1, fadeIn);
      } else {
        offlineGain.gain.setValueAtTime(1, 0);
      }

      // Configure Fade-Out envelope
      if (fadeOut > 0) {
        const fadeOutStartTime = (endTime - startTime) - fadeOut;
        if (fadeOutStartTime > 0) {
          offlineGain.gain.setValueAtTime(1, fadeOutStartTime);
          offlineGain.gain.linearRampToValueAtTime(0, endTime - startTime);
        }
      }

      bufferSource.start(0, startTime, endTime - startTime);

      const renderedBuffer = await offlineCtx.startRendering();
      const blob = audioBufferToWav(renderedBuffer);

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}_trimmed.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    const ms = Math.floor((timeInSecs % 1) * 100);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}.${ms < 10 ? "0" : ""}${ms}`;
  };

  const handleResetTrim = () => {
    pause();
    setStartTime(0);
    setEndTime(duration);
    setCurrentTime(0);
    setFadeIn(0);
    setFadeOut(0);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Metadata */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight truncate max-w-xs md:max-w-md">
              {fileName}
            </h4>
            <p className="text-xs text-muted">
              Waveform Timeline • Selection duration: {formatTime(endTime - startTime)}
            </p>
          </div>
        </div>
        <button
          onClick={handleResetTrim}
          className="text-xs font-bold text-accent hover:text-accent-hover bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Cropping
        </button>
      </div>

      {/* WAVEFORMS TIMELINE CHANGER */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline px-1 text-xs text-muted font-bold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Start Marker</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> End Marker</span>
        </div>
        <div className="relative h-32 glass-panel border border-black/5 rounded-2xl overflow-hidden cursor-ew-resize shadow-soft">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            width={700}
            height={128}
            onClick={handleTimelineClick}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted px-1">
          <span>0:00.00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* INTERVAL SLIDERS AND PRECISION TRIMMING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* START BOUNDS CARD */}
        <div className="p-6 rounded-3xl glass-panel border border-black/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs uppercase tracking-wider text-muted">Start Interval Cut</span>
            <span className="px-2.5 py-1 text-xs font-black bg-accent/10 text-accent rounded-full font-mono">
              {formatTime(startTime)}
            </span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={endTime}
              step="0.01"
              value={startTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setStartTime(val);
                if (currentTime < val) setCurrentTime(val);
              }}
              className="w-full accent-accent h-2 cursor-pointer bg-black/10 rounded-lg"
            />
            {/* Fine tuning buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setStartTime(Math.max(0, startTime - 1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                -1s
              </button>
              <button
                onClick={() => setStartTime(Math.max(0, startTime - 0.1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                -0.1s
              </button>
              <button
                onClick={() => setStartTime(Math.min(endTime - 0.1, startTime + 0.1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                +0.1s
              </button>
              <button
                onClick={() => setStartTime(Math.min(endTime - 1, startTime + 1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                +1s
              </button>
            </div>
          </div>
        </div>

        {/* END BOUNDS CARD */}
        <div className="p-6 rounded-3xl glass-panel border border-black/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs uppercase tracking-wider text-muted">End Interval Cut</span>
            <span className="px-2.5 py-1 text-xs font-black bg-secondary/10 text-secondary rounded-full font-mono">
              {formatTime(endTime)}
            </span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={startTime}
              max={duration}
              step="0.01"
              value={endTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEndTime(val);
                if (currentTime > val) setCurrentTime(val);
              }}
              className="w-full accent-secondary h-2 cursor-pointer bg-black/10 rounded-lg"
            />
            {/* Fine tuning buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setEndTime(Math.max(startTime + 1, endTime - 1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                -1s
              </button>
              <button
                onClick={() => setEndTime(Math.max(startTime + 0.1, endTime - 0.1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                -0.1s
              </button>
              <button
                onClick={() => setEndTime(Math.min(duration, endTime + 0.1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                +0.1s
              </button>
              <button
                onClick={() => setEndTime(Math.min(duration, endTime + 1))}
                className="flex-1 text-[11px] font-bold py-1.5 rounded-xl border border-black/5 bg-black/5 hover:bg-black/10 transition-colors"
              >
                +1s
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIO FADE SETTINGS CARD */}
      <div className="p-6 rounded-3xl glass-panel border-white/60 shadow-glass grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wide text-foreground block">Fade-In Duration</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={fadeIn}
              onChange={(e) => setFadeIn(parseFloat(e.target.value))}
              className="w-full accent-accent bg-black/10 h-1.5 rounded"
            />
            <span className="text-xs font-mono font-bold text-muted w-12 text-right">{fadeIn.toFixed(1)}s</span>
          </div>
          <p className="text-[10px] text-muted">Transitions the audio volume smoothly from 0% at the start.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wide text-foreground block">Fade-Out Duration</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={fadeOut}
              onChange={(e) => setFadeOut(parseFloat(e.target.value))}
              className="w-full accent-secondary bg-black/10 h-1.5 rounded"
            />
            <span className="text-xs font-mono font-bold text-muted w-12 text-right">{fadeOut.toFixed(1)}s</span>
          </div>
          <p className="text-[10px] text-muted">Transitions the audio volume smoothly to 0% at the end.</p>
        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl glass-panel border-white/60 shadow-glass">
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
            <div className="text-xl font-display font-bold text-foreground">
              {formatTime(currentTime)}
              <span className="text-muted text-sm font-normal"> / {formatTime(duration)}</span>
            </div>
            {/* Timeline looping check */}
            <label className="inline-flex items-center gap-2 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isLooping}
                onChange={() => setIsLooping(!isLooping)}
                className="accent-foreground rounded w-3.5 h-3.5"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Loop Clip Range</span>
            </label>
          </div>
        </div>

        <button
          onClick={exportTrimmed}
          disabled={isExporting}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background hover:bg-black/85 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Scissors className="w-4 h-4" />
          )}
          Download Cut Section
        </button>
      </div>
    </div>
  );
}
