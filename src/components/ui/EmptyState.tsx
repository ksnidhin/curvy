import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionText = "Go Home", actionHref = ROUTES.home }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6 text-sage">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 15h8"></path>
          <path d="M9 9h.01"></path>
          <path d="M15 9h.01"></path>
        </svg>
      </div>
      <h3 className="text-xl md:text-2xl font-heading text-foreground mb-2">{title}</h3>
      <p className="text-muted max-w-md mb-8">{description}</p>
      
      {actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center justify-center bg-foreground hover:bg-foreground/90 text-white px-6 py-3 rounded-[var(--radius-button)] font-medium transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
