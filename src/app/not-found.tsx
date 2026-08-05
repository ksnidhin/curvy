import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="font-heading text-8xl text-accent/80 font-bold mb-4 relative z-0">
        404
      </div>
      <div className="relative z-10 -mt-12 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-border">
        <h2 className="text-2xl md:text-3xl font-heading text-foreground mb-4">Page not found</h2>
        <p className="text-muted max-w-sm mb-8 mx-auto">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        
        <Link 
          href={ROUTES.home}
          className="inline-flex items-center justify-center bg-foreground hover:bg-foreground/90 text-white px-8 py-3 rounded-[var(--radius-button)] font-medium transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
