import { Category } from "../types/category";
import { JsonDatabase } from "../json-db";

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  getFeatured(limit?: number): Promise<Category[]>;
  create(data: Omit<Category, "id"> | Category): Promise<Category>;
  update(id: string, data: Partial<Category>): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<Category | null>;
}

export class CategoryRepository implements ICategoryRepository {
  private db: JsonDatabase<Category>;

  constructor() {
    this.db = new JsonDatabase<Category>('categories.json');
  }

  async getAll(): Promise<Category[]> {
    const categories = await this.db.getAll();
    return categories.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getAll();
    return categories.find(c => c.slug === slug) || null;
  }

  async getById(id: string): Promise<Category | null> {
    return this.db.getById(id);
  }

  async getFeatured(limit = 8): Promise<Category[]> {
    const categories = await this.getAll();
    return categories.slice(0, limit);
  }

  async create(data: Omit<Category, "id"> | Category): Promise<Category> {
    return this.db.create(data);
  }

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    return this.db.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id);
  }
}

export const categoryRepository = new CategoryRepository();
