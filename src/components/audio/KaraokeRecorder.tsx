"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, Square, Play, Pause, Download, Volume2, Settings, RefreshCw, Trash2 } from "lucide-react";
import { audioBufferToWav, getAudioContextClass } from "@/lib/audioDsp";

interface KaraokeRecorderProps {
  instrumentalBuffer: AudioBuffer;
  fileName: string;
}

export function KaraokeRecorder({
  instrumentalBuffer,
  fileName,
}: KaraokeRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);

  // Mix Balance Sliders
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [instVolume, setInstVolume] = useState(0.8);
  const [latencyOffset, setLatencyOffset] = useState(-100); // in milliseconds, default shift voice backward (left) to compensate for mic delay

  const [isExporting, setIsExporting] = useState(false);

  // Refs for Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const instSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const instGainRef = useRef<GainNode | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);

  // Media Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Canvas visualizer refs
  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const drawFrameRef = useRef<number | null>(null);

  const duration = instrumentalBuffer.duration;

  // Initialize Web Audio Context
  useEffect(() => {
    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const instGain = ctx.createGain();
    const voiceGain = ctx.createGain();

    instGain.connect(ctx.destination);
    voiceGain.connect(ctx.destination);

    instGainRef.current = instGain;
    voiceGainRef.current = voiceGain;

    // Set volumes
    instGain.gain.setValueAtTime(instVolume, ctx.currentTime);
    voiceGain.gain.setValueAtTime(voiceVolume, ctx.currentTime);

    return () => {
      stopPlayback();
      cleanupRecording();
      ctx.close();
    };
  }, []);

  // Update Volumes and Syncs
  useEffect(() => {
    if (instGainRef.current && voiceGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      instGainRef.current.gain.setTargetAtTime(instVolume, ctx.currentTime, 0.01);
      voiceGainRef.current.gain.setTargetAtTime(voiceVolume, ctx.currentTime, 0.01);
    }
  }, [instVolume, voiceVolume]);

  const stopPlayback = useCallback(() => {
    if (instSourceRef.current) {
      try { instSourceRef.current.stop(); } catch {}
    }
    if (voiceSourceRef.current) {
      try { voiceSourceRef.current.stop(); } catch {}
    }
    setIsPlaying(false);
  }, []);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (drawFrameRef.current) cancelAnimationFrame(drawFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Play backing instrumental track during recording
  const playInstrumentalOnly = () => {
    const ctx = audioCtxRef.current;
    const instGain = instGainRef.current;
    if (!ctx || !instGain) return;

    if (instSourceRef.current) {
      try { instSourceRef.current.stop(); } catch {}
    }

    const instSource = ctx.createBufferSource();
    instSource.buffer = instrumentalBuffer;
    instSource.connect(instGain);
    instSource.start(0, 0);
    instSourceRef.current = instSource;
  };

  // Render Real-time Microphone Wave ripples
  const drawMicFeedback = useCallback(() => {
    const canvas = micCanvasRef.current;
    const analyser = micAnalyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      drawFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(250, 250, 250, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#8B5CF6"; // Purple trace
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);
    cleanupRecording();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    stopPlayback();
  }, [isRecording, stopPlayback]);

  // Request Mic and start recording
  const startRecording = async () => {
    stopPlayback();
    setRecordedBuffer(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ctx = audioCtxRef.current;
      if (ctx) {
        // Setup mic visualizer nodes
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        micAnalyserRef.current = analyser;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Convert blob to Web Audio Buffer for synchronized playback and latency adjustments
        const arrayBuffer = await blob.arrayBuffer();
        const context = audioCtxRef.current;
        if (context) {
          context.decodeAudioData(arrayBuffer, (decodedBuffer) => {
            setRecordedBuffer(decodedBuffer);
          }, (err) => {
            console.error("Decoding voice audio error: ", err);
          });
        }
      };

      // Start Recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start backing playback
      playInstrumentalOnly();

      // Trigger Mic feedback visualization
      setTimeout(drawMicFeedback, 50);

      // Interval clock
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= duration) {
            stopRecording();
            return duration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone: ", err);
      alert("Microphone access is required to record. Please ensure you allow permissions.");
    }
  };

  // Plays synced backing + vocal recording
  const playSynchronized = (offset: number) => {
    const ctx = audioCtxRef.current;
    const instGain = instGainRef.current;
    const voiceGain = voiceGainRef.current;

    if (!ctx || !instGain || !voiceGain || !recordedBuffer) return;

    stopPlayback();

    // Spawn Sources
    const instSource = ctx.createBufferSource();
    instSource.buffer = instrumentalBuffer;
    instSource.connect(instGain);

    const voiceSource = ctx.createBufferSource();
    voiceSource.buffer = recordedBuffer;
    voiceSource.connect(voiceGain);

    // Sync ended callbacks
    instSource.onended = () => {
      if (instSourceRef.current === instSource) {
        setIsPlaying(false);
      }
    };

    // Calculate Latency shift: Positive moves vocal right, negative moves left
    const latencyDelay = latencyOffset / 1000; // in seconds
    const voiceStartOffset = offset;
    const voiceScheduledDelay = Math.max(0, latencyDelay);
    const voiceSkipAhead = Math.max(0, -latencyDelay);

    // Playback
    instSource.start(0, offset);

    // Voice scheduling compensates for input latency shifts
    if (voiceStartOffset + voiceSkipAhead < recordedBuffer.duration) {
      voiceSource.start(ctx.currentTime + voiceScheduledDelay, voiceStartOffset + voiceSkipAhead);
    }

    instSourceRef.current = instSource;
    voiceSourceRef.current = voiceSource;
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playSynchronized(0);
    }
  };

  const handleDeleteRecord = () => {
    stopPlayback();
    setRecordedBuffer(null);
  };

  // Merge Backing instrumental + recorded Voice buffer with gains and latency!
  const exportKaraokeMix = async () => {
    if (!recordedBuffer) return;
    setIsExporting(true);

    try {
      const sampleRate = instrumentalBuffer.sampleRate;
      const length = instrumentalBuffer.length;

      const ctx = audioCtxRef.current || new AudioContext();
      const mixBuffer = ctx.createBuffer(2, length, sampleRate);

      const mixL = mixBuffer.getChannelData(0);
      const mixR = mixBuffer.getChannelData(1);

      const instL = instrumentalBuffer.getChannelData(0);
      const instR = instrumentalBuffer.numberOfChannels > 1 ? instrumentalBuffer.getChannelData(1) : instL;

      const voiceL = recordedBuffer.getChannelData(0);
      const voiceR = recordedBuffer.numberOfChannels > 1 ? recordedBuffer.getChannelData(1) : voiceL;

      const latencyFrames = Math.round((latencyOffset / 1000) * sampleRate);

      // Perform sum mix calculation frame by frame
      for (let i = 0; i < length; i++) {
        // Backing Instrumental
        const backingFrameL = instL[i] * instVolume;
        const backingFrameR = instR[i] * instVolume;

        // Recorded voice shifted in time to line up with beat (comping latency lag)
        const voiceFrameIdx = i - latencyFrames;
        let voiceFrameL = 0;
        let voiceFrameR = 0;

        if (voiceFrameIdx >= 0 && voiceFrameIdx < recordedBuffer.length) {
          voiceFrameL = voiceL[voiceFrameIdx] * voiceVolume;
          voiceFrameR = voiceR[voiceFrameIdx] * voiceVolume;
        }

        mixL[i] = backingFrameL + voiceFrameL;
        mixR[i] = backingFrameR + voiceFrameR;
      }

      // Encode and download WAV
      const blob = audioBufferToWav(mixBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}_SingAlong_Cover.wav`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* File metadata info */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent animate-pulse">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight truncate max-w-xs md:max-w-md">
              {fileName} (Instrumental Backing)
            </h4>
            <p className="text-xs text-muted">
              Length: {formatSeconds(duration)} • Put on your headphones and record!
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-accent/10 text-accent rounded-full">
          Karaoke Studio
        </span>
      </div>

      {/* RECORDING / MICROPHONE SCREEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* MIC CONSOLE PANEL */}
        <div className="p-8 rounded-3xl glass-panel border-white/60 shadow-glass flex flex-col justify-between items-center text-center relative overflow-hidden group min-h-[250px]">
          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-wider font-bold text-muted">
            Microphone Interface
          </span>

          <div className="my-6">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center border-4 border-red-300 animate-pulse transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <Square className="w-8 h-8 fill-current" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center border-4 border-violet-300 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-sm uppercase tracking-wider text-foreground">
              {isRecording ? `Recording voice... ${formatSeconds(recordingSeconds)}` : "Start Voice Recording"}
            </h5>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              Ensure you are wearing headphones to avoid feedback loop squealing and bleed from the backing track!
            </p>
          </div>
        </div>

        {/* FEEDBACK GRAPHICS */}
        <div className="p-8 rounded-3xl glass-panel border-white/60 shadow-glass flex flex-col justify-between items-center relative overflow-hidden min-h-[250px]">
          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-wider font-bold text-muted">
            Mic Amplitude Feedback
          </span>

          <div className="w-full flex-grow flex items-center justify-center my-6 h-28 border border-black/5 rounded-2xl bg-black/5 overflow-hidden">
            {isRecording ? (
              <canvas ref={micCanvasRef} width={250} height={112} className="w-full h-full block" />
            ) : recordedBuffer ? (
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-secondary">Vocal track successfully recorded!</p>
                <p className="text-xs text-muted">{formatSeconds(recordedBuffer.duration)} long • ready for mixing</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-xs text-muted">Microphone visualization appears here while recording.</p>
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-muted font-bold uppercase">Backing track length</span>
            <span className="text-xs font-mono font-bold">{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>

      {/* MIX PANEL & SLIDERS (Visible after recording completes) */}
      {recordedBuffer && (
        <div className="p-6 rounded-3xl glass-panel border-white/60 shadow-glass space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm tracking-wide uppercase text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" /> Custom Studio Mix Desk
            </h4>
            <button
              onClick={handleDeleteRecord}
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Vocal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {/* BACKING INSTRUMENTAL SLIDER */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">INSTRUMENTAL VOL</span>
                <span className="text-foreground">{Math.round(instVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-muted" />
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.05"
                  value={instVolume}
                  onChange={(e) => setInstVolume(parseFloat(e.target.value))}
                  className="w-full accent-secondary bg-black/10 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* RECORDED VOICE SLIDER */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">MY VOCALS VOL</span>
                <span className="text-foreground">{Math.round(voiceVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-muted" />
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-full accent-accent bg-black/10 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* VOCAL LATENCY CALIBRATOR */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">VOCAL LATENCY SYNC</span>
                <span className="text-foreground">{latencyOffset} ms</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-muted" />
                <input
                  type="range"
                  min="-400"
                  max="400"
                  step="5"
                  value={latencyOffset}
                  onChange={(e) => setLatencyOffset(parseInt(e.target.value))}
                  className="w-full accent-foreground bg-black/10 h-1.5 rounded cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-muted text-right">Adjust if your vocals sound behind or ahead of the beat.</p>
            </div>
          </div>

          {/* PLAYBACK CONTROLLER FOR MIX PREVIEW */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-black/5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={togglePlayback}
                className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-accent hover:scale-105 active:scale-95 flex items-center justify-center shadow-soft transition-all duration-300"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>
              <div>
                <div className="text-base font-bold text-foreground">
                  {isPlaying ? "Auditioning Studio Mix" : "Preview Your Recording"}
                </div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted">
                  Playback synched with backing track
                </p>
              </div>
            </div>

            <button
              onClick={exportKaraokeMix}
              disabled={isExporting}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background hover:bg-black/85 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Full Cover Mix
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
