import { categoryRepository } from "@/lib/repositories/category.repository";
import { productRepository } from "@/lib/repositories/product.repository";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { notFound } from "next/navigation";
import { ROUTES } from "@/lib/config/routes";
import { FilterToggle } from "@/components/ui/FilterToggle";
import { filterAndSortProducts } from "@/lib/utils/filter-products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await categoryRepository.getBySlug(slug);
  if (!category) return { title: 'Not Found' };
  return {
    title: `${category.name} | Curvy Girls`,
    description: `Shop the best ${category.name.toLowerCase()} curated for curvy women.`,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await categoryRepository.getBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const rawProducts = await productRepository.getByCategory(slug);
  const products = filterAndSortProducts(rawProducts, resolvedSearchParams);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">{category.name}</h1>
          <p className="text-muted">Showing {products.length} {products.length === 1 ? 'result' : 'results'}</p>
        </div>
        
        {rawProducts.length > 0 && (
          <div className="flex justify-center md:justify-end">
            <FilterToggle />
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState 
          title="No products found" 
          description="Try adjusting your filters or browse other categories."
          actionText="Clear Filters"
          actionHref={ROUTES.category(slug)}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
