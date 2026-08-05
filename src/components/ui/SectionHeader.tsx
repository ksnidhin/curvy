import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export function SectionHeader({ title, viewAllLink, viewAllText = "View all" }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-6">
      <h2 className="text-2xl md:text-3xl font-heading text-foreground">{title}</h2>
      {viewAllLink && (
        <Link 
          href={viewAllLink}
          className="text-sm font-medium text-muted hover:text-sage transition-colors flex items-center gap-1"
        >
          {viewAllText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
