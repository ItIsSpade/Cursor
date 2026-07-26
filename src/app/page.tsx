import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AudioStudio } from "@/components/audio/AudioStudio";
import { Zap, Shield, CheckCircle, Activity, FileCode, Cpu } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Header Space & Interactive Audio Studio */}
      <section className="relative pt-36 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

        {/* Core Workspace */}
        <div className="relative z-10 w-full">
          <AudioStudio />
        </div>
      </section>

      {/* Technical Deep-Dive / Value Proposition */}
      <section className="py-24 bg-surface relative overflow-hidden border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight">
              Behind the <span className="text-accent">DSP Engineering</span>
            </h2>
            <p className="text-muted mt-3 max-w-lg mx-auto text-sm md:text-base">
              VocalSplitter runs 100% locally in your web browser. Discover the math and algorithms power behind our offline audio engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* DSP Crossover */}
            <div className="p-8 rounded-3xl glass-panel border border-black/5 hover:border-accent/20 transition-all duration-300 shadow-soft relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-3">
                Bass Crossover Removal
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                Standard karaoke filters strip vocals but make the backing track sound thin by removing bass. Our engine uses a <strong>Low-Pass Crossover filter (cutoff ~150Hz)</strong> to bypass vocal subtraction for low-end frequencies, keeping the kicks and sub-basses perfectly punchy.
              </p>
            </div>

            {/* Chroma Profiling */}
            <div className="p-8 rounded-3xl glass-panel border border-black/5 hover:border-secondary/20 transition-all duration-300 shadow-soft relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-3">
                Krumhansl Chromagrams
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                We detect musical keys by taking DFT snapshots across the audio spectrum, summing energies of the 12 chromatic semitones. This 12-dimensional chroma vector is matched with <strong>Krumhansl-Schmuckler profiles</strong> using Pearson correlation to discover major/minor scales and Camelot codes.
              </p>
            </div>

            {/* Autocorrelation */}
            <div className="p-8 rounded-3xl glass-panel border border-black/5 hover:border-accent/20 transition-all duration-300 shadow-soft relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground mb-3">
                Autocorrelation Tempo
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                Our beat detection algorithm downsamples files to 4kHz and extracts the energy amplitude envelope. By running an <strong>autocorrelation lag scan between 55 and 180 BPM</strong>, we match repeating transient patterns to deliver highly accurate BPM tempo calculations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Self Hosting / Unlimited Limits Information */}
      <section className="py-24 bg-background relative border-t border-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 rounded-[2.5rem] glass-panel border-white/80 shadow-glass relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-accent/5 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-secondary/5 blur-3xl rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/10 bg-secondary/5 text-secondary text-xs font-bold uppercase tracking-wide">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% Hostable & Unlimited
                </div>
                <h3 className="font-display text-3xl font-black uppercase tracking-tight text-foreground leading-[1.1]">
                  Deploy Globally with <span className="text-secondary">Zero Limits</span>
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  Unlike traditional services that throttle file uploads and bill you for expensive cloud GPU clusters, VocalSplitter runs completely inside the client&apos;s browser. This means your server only delivers static bundle files—enabling you to host millions of users on free-tier platforms like Vercel with literally <strong>$0 cloud operational overhead</strong>.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Shield className="w-4 h-4 text-accent" /> Privacy Assured: Files never leave the browser
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <FileCode className="w-4 h-4 text-accent" /> Completely Static: No databases, API keys or backends
                  </div>
                </div>
              </div>

              {/* Developer guide */}
              <div className="bg-black/5 border border-black/5 rounded-3xl p-6 space-y-4">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted block">
                  Quick Hosting Instructions
                </span>
                <div className="font-mono text-xs text-foreground bg-white/70 p-4 rounded-xl border border-white/60 space-y-1 shadow-inner overflow-x-auto">
                  <div># 1. Clone your repo branch</div>
                  <div>git clone &lt;your-repo-url&gt;</div>
                  <div className="pt-2"># 2. Install package nodes</div>
                  <div>npm install</div>
                  <div className="pt-2"># 3. Create static prod build</div>
                  <div>npm run build</div>
                  <div className="pt-2"># 4. Deploy build static folder</div>
                  <div>vercel --prod</div>
                </div>
                <p className="text-[10px] text-muted text-center italic">
                  That&apos;s it! VocalSplitter is statically deployable anywhere in 30 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-surface relative border-t border-black/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-black uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How does VocalSplitter offer unlimited, free processing?",
                a: "Traditional services run AI splitting models like Demucs or Spleeter on cloud GPU nodes which cost massive compute fees, forcing them to enforce limits or charge subscriptions. VocalSplitter utilizes highly advanced client-side Web Audio DSP filters, phase-matrix cancellation, and bandpass isolation. It runs completely inside your browser's CPU, costing the host nothing, and allowing you unlimited use!"
              },
              {
                q: "Are my uploaded music files private?",
                a: "Absolutely. Because all calculations, decoding, visualisations, and wav exports happen 100% locally in your own browser, your music files are never uploaded to any server. Your intellectual property and audio data remain completely secure on your machine."
              },
              {
                q: "Can I self-host this tool suite?",
                a: "Yes! The entire application is packaged as a statically deployable Next.js app. There are no databases, no server-side APIs, and no environmental dependencies. You can compile the project using 'npm run build' and host it on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or a custom VPS with infinite traffic scaling and zero hosting cost."
              },
              {
                q: "Which audio formats are supported?",
                a: "Our app decodes any audio file format supported by your modern browser's Web Audio engine, including MP3, WAV, FLAC, M4A, OGG, AAC, and WebM."
              }
            ].map((faq, index) => (
              <div key={index} className="p-6 rounded-2xl bg-black/5 border border-black/5">
                <h4 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">
                  {faq.q}
                </h4>
                <p className="text-muted text-xs leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
