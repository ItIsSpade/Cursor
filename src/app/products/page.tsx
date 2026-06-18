"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { bundles, Category } from "@/data/bundles";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: { label: string; value: Category | 'All' }[] = [
  { label: "All Bundles", value: "All" },
  { label: "Minimalist", value: "Minimalist" },
  { label: "Gaming", value: "Gaming" },
  { label: "Creator", value: "Creator" },
  { label: "Ergonomic", value: "Ergonomic" },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBundles = bundles.filter((bundle) => {
    const matchesCategory = activeCategory === 'All' || bundle.category === activeCategory;
    const matchesSearch = bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bundle.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-16">
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6">
              The <span className="text-accent">Directory</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl">
              Browse our complete collection of curated workspace bundles. Filter by intended use case or search for specific aesthetics.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-white/5">

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300 border",
                    activeCategory === cat.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-muted/50"
              />
            </div>
          </div>

          {/* Grid */}
          {filteredBundles.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredBundles.map((bundle) => (
                  <motion.div
                    key={bundle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard bundle={bundle} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl glass-panel">
              <SlidersHorizontal className="w-12 h-12 text-muted mb-4" />
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">No bundles found</h3>
              <p className="text-muted">Try adjusting your search or category filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-6 text-accent hover:text-accent-hover font-semibold uppercase tracking-wider text-sm transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
