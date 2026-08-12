"use client";

import Link from "next/link";
import { Search, Menu, Heart } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { CONSTANTS } from "@/lib/config/constants";
import { useState, useEffect } from "react";
import { MobileNav } from "./MobileNav";
import { NavLink } from "@/lib/types/settings";
import { useWishlist } from "@/components/wishlist/WishlistContext";

export function HeaderClient({ navLinks, siteName }: { navLinks: NavLink[], siteName: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wishlistIds } = useWishlist();
  
  // Use state to avoid hydration mismatch
  const [wishlistCount, setWishlistCount] = useState(0);
  useEffect(() => {
    setWishlistCount(wishlistIds.length);
  }, [wishlistIds]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden md:flex gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href={ROUTES.home} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center leading-none mt-1 whitespace-nowrap z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src="/images/curvy-girls-logo.svg" 
                alt="Logo" 
                className="h-14 sm:h-16 md:h-20 w-auto shrink-0 object-contain"
              />
              <span className="font-heading text-2xl md:text-[1.75rem] tracking-tight text-foreground">{siteName}</span>
            </div>
            <span className="font-sans text-[10px] md:text-[11px] text-muted italic tracking-widest mt-1.5 md:mt-2">curated with care</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/wishlist" className="p-2 text-foreground hover:text-rose transition-colors relative" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href={ROUTES.search} className="p-2 -mr-2 md:mr-0 text-foreground hover:text-sage transition-colors" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        links={navLinks}
      />
    </>
  );
}
