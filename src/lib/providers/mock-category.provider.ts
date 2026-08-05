import { categories } from "../../../mock/categories";
import { Category } from "../types/category";

export class MockCategoryProvider {
  async getAll(): Promise<Category[]> {
    return categories;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return categories.find(c => c.slug === slug) || null;
  }
}
