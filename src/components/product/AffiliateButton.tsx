import { ExternalLink } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { affiliateService } from "@/lib/services/affiliate.service";
import { ProductOffer } from "@/lib/types/product-advanced";
import { storeRepository } from "@/lib/repositories/store.repository";

interface AffiliateButtonProps {
  productSlug: string;
  storeName: string;
  offers?: ProductOffer[];
}

export async function AffiliateButton({ productSlug, storeName, offers }: AffiliateButtonProps) {
  const disclosure = await affiliateService.getDisclosureText();
  
  return (
    <div className="mt-8 space-y-4">
      {offers && offers.length > 0 ? (
        offers.map(offer => (
          <a 
            key={offer.id}
            href={offer.affiliateUrl || offer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-sage hover:bg-sage/90 text-white px-6 py-4 rounded-[var(--radius-button)] font-medium transition-colors shadow-sm text-lg"
          >
            <span>View on {offer.storeId}</span>
            <div className="flex items-center gap-4">
              <span className="font-bold">₹{offer.price}</span>
              <ExternalLink className="h-5 w-5" />
            </div>
          </a>
        ))
      ) : (
        <a 
          href={ROUTES.affiliateRedirect(productSlug)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-sage hover:bg-sage/90 text-white px-6 py-4 rounded-[var(--radius-button)] font-medium transition-colors shadow-sm text-lg"
        >
          View on {storeName}
          <ExternalLink className="h-5 w-5" />
        </a>
      )}
      
      <div className="bg-[#F9F6F0] p-4 mt-4 rounded-[var(--radius-card)] text-center">
        <p className="text-sm text-muted">
          You'll be redirected to {storeName} to complete your purchase.
        </p>
      </div>
      
      <div className="mt-6 flex gap-4 items-start border border-border p-4 rounded-[var(--radius-card)]">
        <p className="text-xs text-muted leading-relaxed flex-1">
          {disclosure}
        </p>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage flex-shrink-0">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      </div>
    </div>
  );
}
