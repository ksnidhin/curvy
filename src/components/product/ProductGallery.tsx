"use client";

import Image from "next/image";
import { useState } from "react";
import { Image as ImageType } from "@/lib/types/common";

interface ProductGalleryProps {
  images: ImageType[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] md:aspect-[4/5] bg-accent rounded-[var(--radius-card)] flex items-center justify-center">
        <span className="text-muted">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] md:aspect-[4/5] w-full rounded-[var(--radius-card)] overflow-hidden bg-accent">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || `${title} view ${activeIndex + 1}`}
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === activeIndex ? 'bg-foreground' : 'bg-foreground/20'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-4">
          {images.map((image, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-[3/4] rounded-md overflow-hidden bg-accent transition-all ${
                i === activeIndex 
                  ? 'ring-2 ring-sage ring-offset-2 opacity-100' 
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `Thumbnail ${i + 1}`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 25vw, 15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
