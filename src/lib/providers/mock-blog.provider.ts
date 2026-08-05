import { blogs } from "../../../mock/blogs";
import { BlogPost } from "../types/blog";

export class MockBlogProvider {
  async getAll(): Promise<BlogPost[]> {
    return blogs;
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    return blogs.find(b => b.slug === slug) || null;
  }
}
