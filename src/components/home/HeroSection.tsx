'use client';

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/config/routes";
import { useState, useEffect } from "react";

export function HeroSection({ heroImages }: { heroImages: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages]);

  return (
    <section className="relative overflow-hidden border-b border-border/30">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-8 md:gap-16 pt-12 pb-24 md:pt-24 md:pb-32">
          
          {/* Text Content */}
          <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center mt-6 md:mt-16 relative z-10">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground mb-6">
              Elevated style,<br />
              curated for<br />
              <span className="text-sage italic">real curves.</span>
            </h1>
            
            <p className="text-lg text-muted mb-10 max-w-sm leading-relaxed font-medium">
              A carefully edited selection of pieces from trusted stores, designed to fit, flatter, and feel like you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-12">
              <Link 
                href={ROUTES.categories}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-foreground hover:bg-foreground/90 text-white px-8 py-4 rounded-[var(--radius-button)] font-medium transition-colors shadow-sm"
              >
                Browse Categories
              </Link>
              <Link 
                href={ROUTES.about}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent text-foreground hover:text-sage px-2 py-4 font-medium transition-colors"
              >
                How it works <span className="ml-2 font-serif font-light">→</span>
              </Link>
            </div>

            <div className="pt-8 border-t border-border/60 max-w-xs">
              <p className="text-xs text-muted leading-relaxed flex items-start gap-2">
                <span className="text-sage text-base leading-none">✦</span>
                <span>We handpick recommendations from trusted stores. Purchases are completed on the original website.</span>
              </p>
            </div>
          </div>
          
          {/* Editorial Image Slider */}
          <div className="w-full md:w-[55%] lg:w-[60%] flex justify-end">
            <div className="relative w-full aspect-[4/5] md:aspect-[3/4] max-w-2xl rounded-[32px] overflow-hidden bg-accent shadow-sm">
              {heroImages.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt="Editorial shot of a curvy woman"
                  fill
                  className={`object-cover object-[center_20%] sepia-[.10] saturate-[.90] contrast-[.95] brightness-[1.02] transition-opacity duration-1000 ease-in-out ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C4917B]/10 to-transparent mix-blend-overlay pointer-events-none" />
              
              {/* Slider Indicators */}
              {heroImages.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Soft Transition element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none opacity-40" />
    </section>
  );
}
