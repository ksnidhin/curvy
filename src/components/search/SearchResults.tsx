import { SearchResults as ISearchResults } from "@/lib/services/search.service";
import { ProductCard } from "../product/ProductCard";
import { CategoryTile } from "../category/CategoryTile";
import { BlogCard } from "../blog/BlogCard";

interface SearchResultsProps {
  results: ISearchResults;
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const { products, categories, blogs } = results;
  const totalResults = products.length + categories.length + blogs.length;

  if (totalResults === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl md:text-2xl font-heading text-foreground mb-4">
          No results found for "{query}"
        </h2>
        <p className="text-muted">
          Try checking your spelling or using more general terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {categories.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl text-foreground mb-6 border-b border-border pb-2">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryTile key={category.id} category={category} variant="list" />
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl text-foreground mb-6 border-b border-border pb-2">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {blogs.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl text-foreground mb-6 border-b border-border pb-2">Journal Entries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} post={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
