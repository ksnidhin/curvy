import { productRepository } from "@/lib/repositories/product.repository";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Metadata } from "next";
import { FilterToggle } from "@/components/ui/FilterToggle";
import { filterAndSortProducts } from "@/lib/utils/filter-products";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/lib/config/routes";

export const metadata: Metadata = {
  title: "All Products - Lively",
  description: "Browse our complete collection of curated fashion pieces.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawProducts = await productRepository.getAll();
  const products = filterAndSortProducts(rawProducts, resolvedSearchParams);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeader 
          title="All Products" 
          subtitle={`Showing ${products.length} ${products.length === 1 ? 'result' : 'results'}`}
        />
        
        {rawProducts.length > 0 && (
          <div className="flex justify-center md:justify-end">
            <FilterToggle />
          </div>
        )}
      </div>
      
      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState 
            title="No products found" 
            description="Try adjusting your filters to find what you're looking for."
            actionText="Clear Filters"
            actionHref="/products"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
