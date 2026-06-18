"use client";
import Image from "next/image";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { bundles } from "@/data/bundles";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, Box, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const params = useParams();
  const bundle = bundles.find(b => b.id === params.id);

  if (!bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-display text-4xl uppercase font-bold mb-4">Bundle Not Found</h1>
        <Link href="/products">
          <Button>Return to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link href="/products" className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-muted hover:text-foreground transition-colors mb-12">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Image Gallery */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-square rounded-2xl overflow-hidden glass-panel border-white/5 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent z-10" />
                <Image fill
                  src={bundle.imageUrl}
                  alt={bundle.name}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Overlay details */}
                <div className="absolute top-6 left-6 z-20">
                  <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-background/90 backdrop-blur-md border border-white/10 rounded-full text-accent shadow-neon-accent">
                    {bundle.category} Edition
                  </span>
                </div>
              </motion.div>

              {/* Fake thumbnails for design completeness */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <Image fill  src={bundle.imageUrl} alt="" className="object-cover w-full h-full grayscale" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-2">
                {bundle.name}
              </h1>
              <p className="text-xl text-accent font-semibold tracking-wide mb-6">
                ${bundle.price}
              </p>

              <p className="text-muted text-lg leading-relaxed mb-10 border-b border-white/5 pb-10">
                {bundle.description}
              </p>

              {/* What's Included */}
              <div className="mb-10">
                <h3 className="font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Box className="w-5 h-5 text-accent" />
                  Inside the Box
                </h3>
                <ul className="space-y-4">
                  {bundle.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-white/5">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-secondary">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted mt-1">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-4">
                <Button size="lg" className="w-full relative overflow-hidden group">
                  <span className="relative z-10">Acquire Bundle</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Button>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider font-semibold">
                    <Truck className="w-4 h-4 text-accent" /> Free Global Shipping
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wider font-semibold">
                    <ShieldCheck className="w-4 h-4 text-accent" /> 2-Year Warranty
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
