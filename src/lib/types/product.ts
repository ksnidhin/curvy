import { Image } from "./common";
import { ProductStatus, ProductAttribute, ProductSEO, ProductOffer } from "./product-advanced";

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  categorySlug: string;
  description?: string;
  status: ProductStatus;
  isFeatured: boolean;
  
  images: Image[];
  attributes: ProductAttribute;
  seo: ProductSEO;
  
  offers?: ProductOffer[];
  
  // Computed fields (for frontend convenience, resolved by repository)
  price: number; 
  originalPrice?: number;
  storeName: string;
  affiliateUrl: string;
  
  rating?: number;
  reviewCount?: number;
  whyWeLoveThis?: string;
  
  createdAt?: string;
  updatedAt?: string;
}
