import { productRepository } from "../repositories/product.repository";
import { categoryRepository } from "../repositories/category.repository";
import { blogRepository } from "../repositories/blog.repository";
import { Product } from "../types/product";
import { Category } from "../types/category";
import { BlogPost } from "../types/blog";

export interface SearchResults {
  products: Product[];
  categories: Category[];
  blogs: BlogPost[];
}

export class SearchService {
  async search(query: string): Promise<SearchResults> {
    if (!query || query.trim() === "") {
      return { products: [], categories: [], blogs: [] };
    }

    const lowerQuery = query.toLowerCase();

    const [allProducts, allCategories, allBlogs] = await Promise.all([
      productRepository.getAll(),
      categoryRepository.getAll(),
      blogRepository.getAll(),
    ]);

    const products = allProducts.filter(
      p => p.title.toLowerCase().includes(lowerQuery) || 
           (p.description && p.description.toLowerCase().includes(lowerQuery))
    );

    const categories = allCategories.filter(
      c => c.name.toLowerCase().includes(lowerQuery)
    );

    const blogs = allBlogs.filter(
      b => b.title.toLowerCase().includes(lowerQuery) || 
           b.excerpt.toLowerCase().includes(lowerQuery)
    );

    return { products, categories, blogs };
  }
}

export const searchService = new SearchService();
