'use client';

import React, { useEffect, useState } from 'react';
import { useWishlist } from './WishlistContext';
import { getProductsByIds } from '@/app/actions';
import { Product } from '@/lib/types/product';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/lib/config/routes';

export function WishlistGrid() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        const data = await getProductsByIds(wishlistIds);
        setProducts(data);
      } catch (e) {
        console.error('Failed to load wishlist products', e);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 opacity-60">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] bg-accent/20 animate-pulse rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState 
        title="Your wishlist is empty" 
        description="Browse our collections and tap the heart icon to save your favorite styles here."
        actionText="Start Shopping"
        actionHref={ROUTES.home}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
