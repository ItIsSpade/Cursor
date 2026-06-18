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
        whileHover={{ y: -5 }}
        className="glass-panel rounded-xl overflow-hidden h-full flex flex-col border border-white/5 group-hover:border-accent/30 transition-colors relative"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-surface">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
          <Image fill
            src={bundle.imageUrl}
            alt={bundle.name}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100"
          />

          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-background/80 backdrop-blur-md border border-white/10 rounded-full text-foreground">
              {bundle.category}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center shadow-neon-accent">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-bold text-xl text-foreground uppercase tracking-tight group-hover:text-accent transition-colors">
              {bundle.name}
            </h3>
            <span className="font-display font-bold text-lg text-foreground">
              ${bundle.price}
            </span>
          </div>

          <p className="text-muted text-sm mb-4 line-clamp-2">
            {bundle.tagline}
          </p>

          <div className="mt-auto pt-4 border-t border-white/5">
            <p className="text-xs text-muted uppercase tracking-wider font-semibold">
              {bundle.items.length} Items Included
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
