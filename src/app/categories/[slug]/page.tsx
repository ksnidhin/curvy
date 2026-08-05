import { categoryRepository } from "@/lib/repositories/category.repository";
import { productRepository } from "@/lib/repositories/product.repository";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { notFound } from "next/navigation";
import { ROUTES } from "@/lib/config/routes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await categoryRepository.getBySlug(slug);
  if (!category) return { title: 'Not Found' };
  return {
    title: `${category.name} | Curvy Girls`,
    description: `Shop the best ${category.name.toLowerCase()} curated for curvy women.`,
  };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await categoryRepository.getBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const products = await productRepository.getByCategory(slug);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">{category.name}</h1>
        <p className="text-muted">Showing {products.length} {products.length === 1 ? 'result' : 'results'}</p>
      </div>

      {products.length === 0 ? (
        <EmptyState 
          title="No products yet" 
          description={`We are currently curating the best ${category.name.toLowerCase()} for you. Check back soon!`}
          actionText="Browse other categories"
          actionHref={ROUTES.categories}
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
