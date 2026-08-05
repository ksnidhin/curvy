import { BlogPost } from "../types/blog";
import { JsonDatabase } from "../json-db";

export interface IBlogRepository {
  getAll(): Promise<BlogPost[]>;
  getBySlug(slug: string): Promise<BlogPost | null>;
  getLatest(limit?: number): Promise<BlogPost[]>;
  create(data: Omit<BlogPost, "id"> | BlogPost): Promise<BlogPost>;
  update(id: string, data: Partial<BlogPost>): Promise<BlogPost | null>;
  delete(id: string): Promise<boolean>;
}

export class BlogRepository implements IBlogRepository {
  private db: JsonDatabase<BlogPost>;

  constructor() {
    this.db = new JsonDatabase<BlogPost>('blogs.json');
  }

  async getAll(): Promise<BlogPost[]> {
    const posts = await this.db.getAll();
    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getAll();
    return posts.find(p => p.slug === slug) || null;
  }

  async getLatest(limit = 2): Promise<BlogPost[]> {
    const posts = await this.getAll();
    return posts.slice(0, limit);
  }

  async create(data: Omit<BlogPost, "id"> | BlogPost): Promise<BlogPost> {
    const now = new Date().toISOString();
    return this.db.create({
      ...data,
      publishedAt: data.publishedAt || now,
    } as any);
  }

  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost | null> {
    return this.db.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id);
  }
}

export const blogRepository = new BlogRepository();
