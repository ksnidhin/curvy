import { productRepository } from "@/lib/repositories/product.repository";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { AffiliateButton } from "@/components/product/AffiliateButton";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { notFound } from "next/navigation";
import { Star, ChevronLeft, Heart } from "lucide-react";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { ShareButton } from "@/components/ui/ShareButton";
import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepository.getBySlug(slug);
  if (!product) return { title: 'Not Found' };
  return {
    title: `${product.title} | Curvy Girls`,
    description: product.description || `Shop ${product.title} curated for curvy women.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepository.getBySlug(slug);
  
  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
      {/* Mobile Back Button & Actions */}
      <div className="flex md:hidden justify-between items-center mb-6">
        <Link href={ROUTES.category(product.categorySlug)} className="p-2 -ml-2 text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex gap-2">
          <WishlistButton productId={product.id} variant="page" className="text-foreground" />
          <ShareButton title={product.title} className="p-2 text-foreground hover:text-sage transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Left Column: Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          {/* Desktop Back button */}
          <Link 
            href={ROUTES.category(product.categorySlug)} 
            className="hidden md:inline-flex items-center gap-1 text-sm text-muted hover:text-sage mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Category
          </Link>

          <div className="flex justify-between items-start mb-2">
            <h1 className="font-heading text-3xl md:text-4xl leading-tight text-foreground pr-8">
              {product.title}
            </h1>
            <div className="hidden md:flex gap-2">
              <WishlistButton productId={product.id} variant="page" />
              <ShareButton title={product.title} className="p-2 text-muted hover:text-sage transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-muted font-medium">{product.storeName}</span>
            {product.rating && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted/30"></span>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="h-4 w-4 fill-rose text-rose" />
                  <span>{product.rating}</span>
                  {product.reviewCount && <span className="text-muted">({product.reviewCount} reviews)</span>}
                </div>
              </>
            )}
          </div>

          <div className="mb-8">
            <span className="text-2xl font-bold text-foreground">{formattedPrice}</span>
            <p className="text-xs text-muted mt-1">Inclusive of all taxes.</p>
          </div>

          {product.whyWeLoveThis && (
            <div className="bg-[#F9F6F0] p-6 rounded-[var(--radius-card)] mb-8 border border-border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-heading text-lg text-foreground">Why we love this</h3>
                <Heart className="h-5 w-5 text-rose opacity-50" />
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {product.whyWeLoveThis}
              </p>
            </div>
          )}

          {product.description && (
            <div className="mb-8">
              <p className="text-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <ProductDetails attributes={product.attributes} details={product.details} />
          
          <AffiliateButton productSlug={product.slug} storeName={product.storeName} offers={product.offers} />
        </div>
      </div>

      <RelatedProducts productSlug={product.slug} />
    </div>
  );
}
