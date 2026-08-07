'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('curvy_wishlist');
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse wishlist', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('curvy_wishlist', JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isLoaded]);

  const toggleWishlist = (productId: string) => {
    if (!productId) return;
    setWishlistIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
