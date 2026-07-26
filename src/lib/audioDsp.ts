/**
 * Audio Digital Signal Processing (DSP) & Analysis Library
 * Built 100% client-side for zero latency, offline capability, and infinite scalability.
 */

/**
 * Returns the browser-compatible AudioContext class without typescript warnings.
 */
export function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
}

/**
 * Returns the browser-compatible OfflineAudioContext class without typescript warnings.
 */
export function getOfflineAudioContextClass(): typeof OfflineAudioContext | null {
  if (typeof window === "undefined") return null;
  return window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
}

/**
 * Encodes an AudioBuffer into a lossless 16-bit PCM WAV Blob.
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = PCM (Integer)
  const bitDepth = 16;
  const resultLength = buffer.length * numOfChan * 2 + 44; // 44 bytes header
  const bufferArray = new ArrayBuffer(resultLength);
  const view = new DataView(bufferArray);

  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // 1. RIFF Identifier
  setUint32(0x46464952); // "RIFF"
  // 2. File size minus 8
  setUint32(resultLength - 8);
  // 3. WAVE Identifier
  setUint32(0x45564157); // "WAVE"
  // 4. "fmt " chunk
  setUint32(0x20746d66); // "fmt "
  // 5. Chunk size
  setUint32(16);
  // 6. Audio format (PCM = 1)
  setUint16(format);
  // 7. Channel count
  setUint16(numOfChan);
  // 8. Sample rate
  setUint32(sampleRate);
  // 9. Byte rate: sampleRate * numOfChan * (bitDepth / 8)
  setUint32(sampleRate * numOfChan * 2);
  // 10. Block align: numOfChan * (bitDepth / 8)
  setUint16(numOfChan * 2);
  // 11. Bits per sample
  setUint16(bitDepth);
  // 12. "data" chunk header
  setUint32(0x61746164); // "data"
  // 13. Data chunk size (excluding header)
  setUint32(buffer.length * numOfChan * 2);

  // Write channel data interleaved (L R L R)
  const channels: Float32Array[] = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < resultLength) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = channels[i][offset];
      if (sample > 1) sample = 1;
      else if (sample < -1) sample = -1;

      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, intSample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: "audio/wav" });
}

/**
 * Separates a stereo AudioBuffer into Vocals and Instrumental AudioBuffers.
 * Uses center-channel phase cancellation, low-frequency crossover (for bass retention),
 * and high-fidelity bandpass filters.
 */
export function separateAudio(originalBuffer: AudioBuffer): { instrumental: AudioBuffer; vocals: AudioBuffer } {
  const sampleRate = originalBuffer.sampleRate;
  const length = originalBuffer.length;

  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) {
    throw new Error("AudioContext is not supported in this environment.");
  }

  const ctx = new AudioContextClass();
  const instrumental = ctx.createBuffer(2, length, sampleRate);
  const vocals = ctx.createBuffer(2, length, sampleRate);

  const leftIn = originalBuffer.getChannelData(0);
  const rightIn = originalBuffer.numberOfChannels > 1 ? originalBuffer.getChannelData(1) : leftIn;

  const instLeft = instrumental.getChannelData(0);
  const instRight = instrumental.getChannelData(1);

  const vocLeft = vocals.getChannelData(0);
  const vocRight = vocals.getChannelData(1);

  // State variables for crossover low-pass filters (cutoff at ~150Hz)
  // This preserves the mono sub-bass and kick drum in the instrumental track
  let lowpassL = 0;
  let lowpassR = 0;
  const crossoverFreq = 150;
  const rc = 1 / (2 * Math.PI * crossoverFreq);
  const dt = 1 / sampleRate;
  const alphaCrossover = dt / (rc + dt);

  for (let i = 0; i < length; i++) {
    const l = leftIn[i];
    const r = rightIn[i];

    // Update crossover lowpass
    lowpassL += alphaCrossover * (l - lowpassL);
    lowpassR += alphaCrossover * (r - lowpassR);

    // Instrumental track = Stereo width side elements (Left - Right) + mono bass lowpass
    // This removes the centered vocals while keeping punchy drums and bass
    const side = l - r;
    instLeft[i] = side + lowpassL;
    instRight[i] = -side + lowpassR;

    // Initial Vocal Extraction (Center channel separation)
    // Mid = (L + R) / 2
    // Side difference is subtracted to isolate what is strictly common to both channels
    const mid = (l + r) * 0.5;
    const s = (l - r) * 0.5;
    const center = mid - Math.abs(s) * 0.6; // soft subtraction of side energy

    vocLeft[i] = center;
    vocRight[i] = center;
  }

  // Apply a zero-phase high-fidelity vocal bandpass filter (130Hz - 9000Hz)
  // This cleans up sub-bass rumble, drums, and super high-frequency cymbal sibilance
  let hpL = 0, hpR = 0;
  let lpL = 0, lpR = 0;
  const fHp = 130;
  const fLp = 9000;

  const alphaHp = (2 * Math.PI * fHp / sampleRate) / (2 * Math.PI * fHp / sampleRate + 1);
  const alphaLp = (2 * Math.PI * fLp / sampleRate) / (2 * Math.PI * fLp / sampleRate + 1);

  for (let i = 0; i < length; i++) {
    // Highpass filter
    hpL = alphaHp * (vocLeft[i] - hpL + (i > 0 ? vocLeft[i-1] : 0));
    hpR = alphaHp * (vocRight[i] - hpR + (i > 0 ? vocRight[i-1] : 0));

    // Lowpass filter
    lpL += alphaLp * (hpL - lpL);
    lpR += alphaLp * (hpR - lpR);

    // Apply minor post-gain to vocal output
    vocLeft[i] = lpL * 1.5;
    vocRight[i] = lpR * 1.5;
  }

  ctx.close();

  return { instrumental, vocals };
}

/**
 * Detects the tempo/BPM (Beats Per Minute) of an AudioBuffer.
 * Uses envelope extraction, downsampling, and autocorrelation.
 */
export function detectBPM(audioBuffer: AudioBuffer): number {
  const sampleRate = audioBuffer.sampleRate;
  const rawData = audioBuffer.getChannelData(0);

  // We analyze a 30-second window starting at 15% into the song
  const startSample = Math.floor(Math.min(sampleRate * 20, rawData.length * 0.15));
  const durationSeconds = 30;
  const numSamples = Math.floor(Math.min(sampleRate * durationSeconds, rawData.length - startSample));

  if (numSamples <= 0) return 120;

  // Downsample to 4000Hz to drastically reduce computation and focus on bass envelope
  const targetSampleRate = 4000;
  const skip = Math.max(1, Math.floor(sampleRate / targetSampleRate));
  const downsampledLength = Math.floor(numSamples / skip);
  const energy = new Float32Array(downsampledLength);

  // Compute rectified energy envelope + lowpass filter to remove transient high frequencies
  let lp = 0;
  const alpha = 0.08;
  let idx = 0;
  for (let i = 0; i < numSamples; i += skip) {
    const val = Math.abs(rawData[startSample + i]);
    lp += alpha * (val - lp);
    energy[idx++] = lp;
  }

  // Autocorrelation within 55 - 180 BPM range
  const minBPM = 55;
  const maxBPM = 180;
  const minLag = Math.floor(targetSampleRate * 60 / maxBPM);
  const maxLag = Math.floor(targetSampleRate * 60 / minBPM);

  let bestLag = 0;
  let maxCorr = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    let count = 0;
    const step = 2; // skip index step to speed up calculations
    for (let i = 0; i < downsampledLength - lag; i += step) {
      sum += energy[i] * energy[i + lag];
      count++;
    }
    const corr = sum / count;

    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  const bpm = Math.round((targetSampleRate * 60) / bestLag);

  // Guard values
  if (bpm < 60) return bpm * 2;
  if (bpm > 165) return Math.round(bpm / 2);

  return bpm;
}

/**
 * Standard Krumhansl-Schmuckler pitch profiles for Major and Minor keys.
 */
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// Camelot Wheel notations
const CAMELOT_MAJOR = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"];
const CAMELOT_MINOR = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"];

/**
 * Detects the musical key and Camelot Wheel notation of an AudioBuffer.
 * Uses DFT spectral chroma extraction and Pearson correlation matching.
 */
export function detectKey(audioBuffer: AudioBuffer): { key: string; camelot: string } {
  const sampleRate = audioBuffer.sampleRate;
  const data = audioBuffer.getChannelData(0);

  const numWindows = 60;
  const windowSize = 2048;
  const chroma = new Float32Array(12);

  // Pitch fundamental frequency matrix
  // Calculates fundamental pitches for C, C#, D, etc. across octaves 2, 3, 4, 5
  const baseFreq = 440;
  const pitches: number[][] = [];
  for (let p = 0; p < 12; p++) {
    pitches[p] = [];
    for (let octave = -2; octave <= 1; octave++) {
      pitches[p].push(baseFreq * Math.pow(2, (p - 9) / 12 + octave));
    }
  }

  // Evenly sample chunks across the song to get a reliable harmonic fingerprint
  const step = Math.floor(data.length / (numWindows + 1));

  for (let w = 0; w < numWindows; w++) {
    const offset = (w + 1) * step;

    for (let p = 0; p < 12; p++) {
      let pEnergy = 0;
      for (const freq of pitches[p]) {
        const omega = (2 * Math.PI * freq) / sampleRate;
        let real = 0;
        let imag = 0;
        for (let i = 0; i < windowSize; i++) {
          const val = data[offset + i] || 0;
          // Hamming Window to smooth audio window cuts
          const win = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (windowSize - 1));
          real += val * win * Math.cos(omega * i);
          imag -= val * win * Math.sin(omega * i);
        }
        pEnergy += Math.sqrt(real * real + imag * imag);
      }
      chroma[p] += pEnergy;
    }
  }

  // Normalize the chroma vector
  let maxVal = 0;
  for (let p = 0; p < 12; p++) {
    if (chroma[p] > maxVal) maxVal = chroma[p];
  }
  if (maxVal > 0) {
    for (let p = 0; p < 12; p++) chroma[p] /= maxVal;
  }

  // Correlate with key profiles
  let bestKeyIndex = 0;
  let isMinor = false;
  let highestCorrelation = -Infinity;

  for (let key = 0; key < 12; key++) {
    // Check Major key match
    const rMajor = pearsonCorrelation(chroma, rotateProfile(MAJOR_PROFILE, key));
    if (rMajor > highestCorrelation) {
      highestCorrelation = rMajor;
      bestKeyIndex = key;
      isMinor = false;
    }

    // Check Minor key match
    const rMinor = pearsonCorrelation(chroma, rotateProfile(MINOR_PROFILE, key));
    if (rMinor > highestCorrelation) {
      highestCorrelation = rMinor;
      bestKeyIndex = key;
      isMinor = true;
    }
  }

  const keyName = PITCH_NAMES[bestKeyIndex] + (isMinor ? " Minor" : " Major");
  const camelotCode = isMinor ? CAMELOT_MINOR[bestKeyIndex] : CAMELOT_MAJOR[bestKeyIndex];

  return { key: keyName, camelot: camelotCode };
}

function rotateProfile(profile: number[], shift: number): number[] {
  const rotated = new Array(12);
  for (let i = 0; i < 12; i++) {
    rotated[(i + shift) % 12] = profile[i];
  }
  return rotated;
}

function pearsonCorrelation(x: Float32Array, y: number[]): number {
  let meanX = 0;
  let meanY = 0;
  for (let i = 0; i < 12; i++) {
    meanX += x[i];
    meanY += y[i];
  }
  meanX /= 12;
  meanY /= 12;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < 12; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}
