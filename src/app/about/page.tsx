import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Target, Zap, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8">
            Our <span className="text-accent">Philosophy</span>
          </h1>

          <div className="prose prose-invert prose-lg">
            <p className="text-xl text-muted leading-relaxed mb-12">
              DESKED was born out of frustration with the generic. We believe that your workspace is more than just a place to put your computer—it&apos;s an environment that shapes your mindset, focus, and creativity.
            </p>

            <div className="space-y-16">
               <div className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity duration-500 text-accent">
                    <Target className="w-24 h-24" />
                  </div>
                  <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-4 relative z-10">Opinionated Design</h2>
                  <p className="text-muted leading-relaxed relative z-10 max-w-2xl">
                    We don&apos;t offer infinite customization because infinite choices often lead to compromised aesthetics. Instead, we make deliberate, opinionated choices. Every bundle is a complete thought, a cohesive visual identity curated for specific tastes and workflows.
                  </p>
               </div>

               <div className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity duration-500 text-secondary">
                    <Zap className="w-24 h-24" />
                  </div>
                  <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-4 relative z-10">Uncompromising Performance</h2>
                  <p className="text-muted leading-relaxed relative z-10 max-w-2xl">
                    A beautiful setup is useless if it doesn&apos;t perform. We source top-tier components—from mechanical switches and optical sensors to acoustic dampening materials. We ensure that our aesthetic choices never sacrifice utility or durability.
                  </p>
               </div>

               <div className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity duration-500 text-accent">
                    <Layers className="w-24 h-24" />
                  </div>
                  <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-4 relative z-10">Harmonious Integration</h2>
                  <p className="text-muted leading-relaxed relative z-10 max-w-2xl">
                    Building a setup piecemeal often results in clashing materials, mismatched colors, and software conflicts. We solve the compatibility puzzle. By purchasing a DESKED bundle, you are guaranteed that every item plays nice with the rest, both visually and functionally.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
