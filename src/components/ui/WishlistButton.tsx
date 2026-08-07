"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistContext";

interface WishlistButtonProps {
  productId?: string;
  className?: string;
  variant?: 'card' | 'page';
}

export function WishlistButton({ productId, className = "", variant = 'card' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = productId ? isInWishlist(productId) : false;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (productId) {
      toggleWishlist(productId);
    }
  };

  const baseStyles = variant === 'card'
    ? "p-2 rounded-full bg-white/70 backdrop-blur-sm transition-all shadow-sm z-10 hover:bg-white"
    : "p-2 transition-colors";
    
  const textStyles = isSaved
    ? "text-rose" 
    : (variant === 'card' ? "text-muted hover:text-rose" : "text-muted hover:text-rose");

  return (
    <button 
      className={`${baseStyles} ${textStyles} ${className}`}
      aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      onClick={handleToggle}
    >
      <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}
