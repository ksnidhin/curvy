import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

export const metadata = {
  title: 'About | Curvy Girls',
  description: 'Our story and mission.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-8 text-center leading-tight">
        Curated with care, <br />
        <span className="text-rose italic">for real bodies.</span>
      </h1>

      <div className="prose prose-lg prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted max-w-none">
        <p className="text-xl md:text-2xl leading-relaxed text-foreground font-medium text-center mb-12">
          Curvy Girls isn't just a platform; it's a celebration of fashion that fits, flatters, and feels like you.
        </p>

        <h2 className="text-2xl mt-12 mb-4">Our Story</h2>
        <p className="mb-6">
          We noticed a glaring gap in the fashion industry: finding beautiful, well-fitting clothes for curvy women was harder than it should be. The options were either uninspired, poorly tailored, or hidden deep within massive catalogs. 
        </p>
        <p className="mb-12">
          That's why we started Curvy Girls. We spend hours scouring the internet, testing fabrics, reading reviews, and trying on pieces so you don't have to. We sift through the noise to bring you only the best from trusted stores.
        </p>

        <h2 className="text-2xl mb-4">How We Work</h2>
        <p className="mb-6">
          We are not a store. We don't manufacture clothes, and we don't handle shipping. Think of us as your personal stylist and fashion journal. We recommend products we genuinely love. When you find something you like, we redirect you to the retailer's site to complete your purchase safely and securely.
        </p>
        <p className="mb-12">
          To keep this platform running, we use affiliate links. This means we may earn a small commission at no extra cost to you when you buy through our links. It's what allows us to keep curating the best fashion for you, completely free of charge.
        </p>

        <div className="bg-accent/50 p-8 rounded-[var(--radius-card)] text-center mt-12">
          <h3 className="text-2xl font-heading text-foreground mb-4">Ready to find your next favorite outfit?</h3>
          <Link 
            href={ROUTES.categories}
            className="inline-block bg-foreground text-white px-8 py-3 rounded-[var(--radius-button)] font-medium hover:bg-foreground/90 transition-colors mt-2"
          >
            Start Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
