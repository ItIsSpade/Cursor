"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bundle } from "@/data/bundles";
import { ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  bundle: Bundle;
}

export function ProductCard({ bundle }: ProductCardProps) {
  return (
    <Link href={`/products/${bundle.id}`} className="group block">
      <motion.div
        whileHover={{ y: -8 }}
        className="glass-panel rounded-3xl overflow-hidden h-full flex flex-col border border-white/60 hover:border-accent/40 hover:shadow-soft transition-all duration-500 relative"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface p-2">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 rounded-2xl" />
          <div className="w-full h-full relative rounded-2xl overflow-hidden">
             <Image
                src={bundle.imageUrl}
                alt={bundle.name}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
          </div>

          <div className="absolute top-6 left-6 z-20">
            <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-md border border-white/20 rounded-full text-foreground shadow-sm">
              {bundle.category}
            </span>
          </div>

          <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-surface text-foreground flex items-center justify-center shadow-soft hover:text-accent">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow bg-white/40">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-display font-bold text-xl text-foreground tracking-tight group-hover:text-accent transition-colors">
              {bundle.name}
            </h3>
            <span className="font-display font-semibold text-lg text-foreground bg-white/60 px-2 py-1 rounded-lg">
              ${bundle.price}
            </span>
          </div>

          <p className="text-muted text-sm mb-6 line-clamp-2">
            {bundle.tagline}
          </p>

          <div className="mt-auto pt-4 border-t border-border/50">
            <p className="text-xs text-muted font-medium">
              Includes {bundle.items.length} items
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
