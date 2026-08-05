import { productRepository } from "@/lib/repositories/product.repository";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products - Lively",
  description: "Browse our complete collection of curated fashion pieces.",
};

export default async function ProductsPage() {
  const products = await productRepository.getAll();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <SectionHeader 
        title="All Products" 
        subtitle="Browse our entire collection." 
      />
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-lg">No products found.</p>
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
