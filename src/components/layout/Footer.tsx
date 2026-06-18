import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-6 h-6 rounded-sm bg-accent flex items-center justify-center">
                <div className="w-2 h-2 bg-background rounded-sm" />
              </div>
              <span className="font-display font-bold text-xl tracking-tighter uppercase text-foreground">Desked</span>
            </Link>
            <p className="text-muted text-sm max-w-xs mt-4">
              Curated workspace bundles designed for those who refuse to compromise on aesthetics or performance.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/products?category=Minimalist" className="text-muted hover:text-accent transition-colors text-sm">Minimalist</Link></li>
              <li><Link href="/products?category=Gaming" className="text-muted hover:text-accent transition-colors text-sm">Gaming</Link></li>
              <li><Link href="/products?category=Creator" className="text-muted hover:text-accent transition-colors text-sm">Creator</Link></li>
              <li><Link href="/products" className="text-muted hover:text-accent transition-colors text-sm">All Bundles</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-muted hover:text-foreground transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted hover:text-foreground transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted hover:text-foreground transition-colors text-sm">Returns</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} DESKED. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-muted hover:text-foreground transition-colors text-xs">Twitter</a>
            <a href="#" className="text-muted hover:text-foreground transition-colors text-xs">Instagram</a>
            <a href="#" className="text-muted hover:text-foreground transition-colors text-xs">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
