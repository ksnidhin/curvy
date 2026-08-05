import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types/product";
import { ROUTES } from "@/lib/config/routes";
import { Heart, Star } from "lucide-react";
import { WishlistButton } from "@/components/ui/WishlistButton";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group flex flex-col h-full bg-card rounded-[var(--radius-card)] overflow-hidden">
      <Link href={ROUTES.product(product.slug)} className="relative aspect-[3/4] overflow-hidden bg-accent/50 block">
        <Image 
          src={product.images?.[0]?.url || "/images/products/placeholder.jpg"}
          alt={product.images?.[0]?.alt || product.title}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <WishlistButton 
          productId={product.id}
          className="absolute top-3 right-3"
          variant="card"
        />
      </Link>
      
      <Link href={ROUTES.product(product.slug)} className="flex flex-col flex-1 p-4">
        <h3 className="font-heading text-base md:text-lg text-foreground line-clamp-2 leading-snug mb-1">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted font-medium mb-1">{product.storeName}</span>
            <span className="font-bold text-foreground">{formattedPrice}</span>
          </div>
          
          {product.rating && (
            <div className="flex items-center gap-1 text-xs font-medium text-foreground bg-accent/50 px-2 py-1 rounded">
              <Star className="h-3 w-3 fill-rose text-rose" />
              <span>{product.rating}</span>
              {product.reviewCount && <span className="text-muted">({product.reviewCount})</span>}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
