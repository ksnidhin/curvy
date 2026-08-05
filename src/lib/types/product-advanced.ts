export type ProductStatus = 'draft' | 'published' | 'hidden';

export interface ProductAttribute {
  clothType?: string;
  length?: string;
  availableSizes?: string[];
  colors?: string[];
  sleeveType?: string;
  neckline?: string;
  fit?: string;
  occasion?: string;
  [key: string]: any;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export interface ProductImage {
  id: string; // references media.json or unique ID
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface AdvancedProduct {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  categorySlug: string;
  description?: string;
  status: ProductStatus;
  isFeatured: boolean;
  
  // Embedded Arrays/Objects for ease of use in JSON DB
  images: ProductImage[];
  attributes: ProductAttribute;
  seo: ProductSEO;
  
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateStore {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
}

export interface ProductOffer {
  id: string;
  productId: string;
  storeId: string;
  url: string;
  affiliateUrl: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  syncStatus: 'success' | 'error' | 'pending';
  lastSyncedAt?: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  offerId: string;
  price: number;
  date: string;
}
