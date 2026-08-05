import { productRepository } from "@/lib/repositories/product.repository";
import { ProductCard } from "../product/ProductCard";
import { SectionHeader } from "../ui/SectionHeader";
import Link from "next/link";

export async function FeaturedProducts() {
  const products = await productRepository.getFeatured(3);

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader title="Chosen for you" />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-foreground rounded-button hover:bg-foreground/90 transition-colors"
          >
            View All Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
