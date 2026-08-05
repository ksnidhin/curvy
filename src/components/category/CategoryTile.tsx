import Image from "next/image";
import Link from "next/link";
import { Category } from "@/lib/types/category";
import { ROUTES } from "@/lib/config/routes";
import { ChevronRight } from "lucide-react";

interface CategoryTileProps {
  category: Category;
  variant?: 'grid' | 'list';
}

export function CategoryTile({ category, variant = 'grid' }: CategoryTileProps) {
  if (variant === 'list') {
    return (
      <Link 
        href={ROUTES.category(category.slug)}
        className="flex items-center justify-between p-4 bg-accent/30 rounded-[var(--radius-card)] hover:bg-accent/60 transition-colors border border-border/40"
      >
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/50 border border-border shadow-sm flex-shrink-0">
            <Image 
              src={category.image.url}
              alt={category.image.alt}
              fill
              className="object-cover opacity-90 p-1"
              sizes="64px"
            />
          </div>
          <span className="font-heading text-lg text-foreground">{category.name}</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>
    );
  }

  // Grid variant (for homepage)
  return (
    <Link 
      href={ROUTES.category(category.slug)}
      className="flex flex-col items-center gap-3 group"
    >
      <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-[var(--radius-card)] bg-accent overflow-hidden transition-transform group-hover:-translate-y-1 group-hover:shadow-sm border border-border/50">
        <Image 
          src={category.image.url}
          alt={category.image.alt}
          fill
          className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          sizes="(max-width: 640px) 96px, 112px"
        />
      </div>
      <span className="text-sm font-medium text-foreground text-center line-clamp-2 leading-tight">
        {category.name}
      </span>
    </Link>
  );
}
