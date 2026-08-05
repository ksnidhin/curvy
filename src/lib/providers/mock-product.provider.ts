import { products } from "../../../mock/products";
import { Product } from "../types/product";

export class MockProductProvider {
  async getAll(): Promise<Product[]> {
    return products;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return products.find(p => p.slug === slug) || null;
  }
}
