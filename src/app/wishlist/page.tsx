import { SectionHeader } from "@/components/ui/SectionHeader";
import { WishlistGrid } from "@/components/wishlist/WishlistGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist | Curvy Girls",
  description: "View your saved styles and favorite products.",
};

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <SectionHeader 
        title="Your Wishlist" 
        subtitle="Styles you love, saved for later."
      />
      <div className="mt-8">
        <WishlistGrid />
      </div>
    </div>
  );
}
