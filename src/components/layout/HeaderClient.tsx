"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { CONSTANTS } from "@/lib/config/constants";
import { useState } from "react";
import { MobileNav } from "./MobileNav";
import { NavLink } from "@/lib/types/settings";

export function HeaderClient({ navLinks, siteName }: { navLinks: NavLink[], siteName: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

          <Link href={ROUTES.home} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none mt-1">
            <span className="font-heading text-3xl tracking-tight text-foreground">{siteName}</span>
            <span className="font-sans text-[11px] text-muted italic tracking-widest mt-1">curated with care</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href={ROUTES.search} className="p-2 -mr-2 text-foreground hover:text-sage transition-colors" aria-label="Search">
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
