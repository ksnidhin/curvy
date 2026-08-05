import { productRepository } from "@/lib/repositories/product.repository";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  productSlug: string;
}

export async function RelatedProducts({ productSlug }: RelatedProductsProps) {
  const relatedProducts = await productRepository.getRelated(productSlug, 3);
  
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="mt-16 md:mt-24">
      <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-6">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
