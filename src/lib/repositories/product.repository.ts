import { Product } from "../types/product";
import { JsonDatabase } from "../json-db";
import { offerRepository } from "./offer.repository";
import { storeRepository } from "./store.repository";

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getFeatured(limit?: number): Promise<Product[]>;
  getByCategory(categorySlug: string): Promise<Product[]>;
  getRelated(productSlug: string, limit?: number): Promise<Product[]>;
  create(data: Omit<Product, "id"> | Product): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  deleteByCategory(categorySlug: string): Promise<void>;
}

export class ProductRepository implements IProductRepository {
  private db: JsonDatabase<Product>;

  constructor() {
    this.db = new JsonDatabase<Product>('products.json');
  }

  private async hydrateProduct(product: Product): Promise<Product> {
    // Ensure slug exists (Next.js 15 bug fix fallback)
    if (!product.slug && product.title) {
      product.slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const offers = await offerRepository.getByProductId(product.id);
    
    if (offers && offers.length > 0) {
      const activeOffers = offers.filter(o => o.inStock !== false); // fallback to true if undefined
      const offersToSort = activeOffers.length > 0 ? activeOffers : offers;
      
      offersToSort.sort((a, b) => a.price - b.price);
      const bestOffer = offersToSort[0];
      const store = await storeRepository.getById(bestOffer.storeId);
      
      return {
        ...product,
        offers,
        price: bestOffer.price,
        originalPrice: bestOffer.originalPrice,
        storeName: store?.name || product.storeName || "Unknown Store",
        affiliateUrl: bestOffer.affiliateUrl || product.affiliateUrl,
      };
    }
    
    return product;
  }

  async getAll(): Promise<Product[]> {
    const products = await this.db.getAll();
    const hydrated = await Promise.all(products.map(p => this.hydrateProduct(p)));
    return hydrated.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const products = await this.getAll(); // getAll now hydrates
    return products.find(p => p.slug === slug) || null;
  }

  async getFeatured(limit = 4): Promise<Product[]> {
    const products = await this.getAll();
    return products.slice(0, limit);
  }

  async getByCategory(categorySlug: string): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(p => p.categorySlug === categorySlug);
  }

  async getRelated(productSlug: string, limit = 4): Promise<Product[]> {
    const product = await this.getBySlug(productSlug);
    if (!product) return [];
    
    const products = await this.getAll();
    return products
      .filter(p => p.categorySlug === product.categorySlug && p.slug !== productSlug)
      .slice(0, limit);
  }

  async create(data: Omit<Product, "id"> | Product): Promise<Product> {
    const now = new Date().toISOString();
    return this.db.create({
      ...data,
      status: data.status || 'published',
      isFeatured: data.isFeatured || false,
      attributes: data.attributes || {},
      seo: data.seo || {},
      createdAt: data.createdAt || now,
      updatedAt: now
    } as any);
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    const now = new Date().toISOString();
    return this.db.update(id, { ...data, updatedAt: now });
  }

  async delete(id: string): Promise<boolean> {
    // Delete related offers
    await offerRepository.deleteByProductId(id);
    return this.db.delete(id);
  }

  async deleteByCategory(categorySlug: string): Promise<void> {
    const products = await this.getAll();
    const toKeep = products.filter(p => p.categorySlug !== categorySlug);
    if (toKeep.length !== products.length) {
      const toDelete = products.filter(p => p.categorySlug === categorySlug);
      for (const p of toDelete) {
        await offerRepository.deleteByProductId(p.id);
      }
      await this.db.write(toKeep);
    }
  }
}

export const productRepository = new ProductRepository();
