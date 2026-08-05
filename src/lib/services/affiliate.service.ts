import { productRepository } from "../repositories/product.repository";
import { settingsRepository } from "../repositories/settings.repository";

export class AffiliateService {
  async getRedirectUrl(productSlug: string): Promise<string | null> {
    const product = await productRepository.getBySlug(productSlug);
    return product ? product.affiliateUrl : null;
  }

  async logClick(productSlug: string): Promise<void> {
    // Phase 1: No-op. Later will log click metadata to the backend.
    console.log(`[AffiliateService] Click logged for product: ${productSlug}`);
  }
  
  async getDisclosureText(): Promise<string> {
    const settings = await settingsRepository.getSiteSettings();
    return settings.affiliateDisclosureText;
  }
}

export const affiliateService = new AffiliateService();
