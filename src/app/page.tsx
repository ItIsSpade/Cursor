import Image from "next/image";
import { HeroScene } from "@/components/3d/HeroScene";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { bundles } from "@/data/bundles";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Zap, Target, Layers } from "lucide-react";

export default function Home() {
  const featuredBundles = bundles.filter(b => b.featured).slice(0, 3);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        <HeroScene />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-muted">Redefining the Workspace</span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.9] mb-6">
              Curated <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                Perfection.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-xl mb-10 leading-relaxed">
              We build distinctive desktop bundles. No templates. No compromises. Just opinionated choices for those who demand excellence in their environment.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="group">
                  Explore Bundles
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Our Philosophy
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-foreground to-transparent" />
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
                Featured <span className="text-accent">Editions</span>
              </h2>
              <p className="text-muted mt-4 max-w-md">
                Hand-picked combinations designed for specific workflows and undeniable aesthetic impact.
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="border-b border-foreground/20 rounded-none pb-1 hover:border-accent">
                View All Directory
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredBundles.map((bundle) => (
              <ProductCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 mix-blend-luminosity" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold uppercase tracking-tight mb-8">
                The Anatomy of a <br />
                <span className="text-secondary">Desked Setup</span>
              </h2>

              <div className="space-y-8">
                {[
                  { icon: Target, title: "Opinionated Design", desc: "We don't do generic. Every piece is selected to contribute to a cohesive, striking visual identity." },
                  { icon: Zap, title: "Uncompromising Performance", desc: "Aesthetics mean nothing if the tools fail. We source only top-tier switches, sensors, and materials." },
                  { icon: Layers, title: "Harmonious Integration", desc: "Colors match. Profiles align. Software plays nice. We solve the compatibility puzzle so you don't have to." }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/10 glass-panel flex items-center justify-center text-accent">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase tracking-wider mb-2">{feature.title}</h3>
                      <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden glass-panel border-white/10 relative">
                 <Image fill
                    src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80"
                    alt="Abstract setup"
                    className="object-cover w-full h-full opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              {/* Floating accent elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-secondary/20 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
