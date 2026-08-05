import { offerRepository } from "../repositories/offer.repository";
import { priceHistoryRepository } from "../repositories/price-history.repository";
import { storeRepository } from "../repositories/store.repository";

export class SyncService {
  /**
   * Simulates a fetch to an external API or scraper to get the latest price.
   */
  async syncOffer(offerId: string): Promise<boolean> {
    try {
      const allOffers = await offerRepository.getByProductId(""); // hack to get all?
      // Wait, we need a getById for offerRepository. Let's assume we fetch all and find it for now since flat file.
      const db = (offerRepository as any).db;
      const offer = await db.getById(offerId);
      
      if (!offer) return false;

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulate a random price change (10% chance)
      const shouldChangePrice = Math.random() > 0.9;
      
      if (shouldChangePrice) {
        const variation = (Math.random() - 0.5) * 200; // random change between -100 and +100
        const newPrice = Math.max(1, Math.round(offer.price + variation));
        
        // Log price history
        await priceHistoryRepository.create({
          productId: offer.productId,
          offerId: offer.id,
          price: newPrice,
          date: new Date().toISOString()
        });

        // Update offer
        await offerRepository.update(offer.id, {
          price: newPrice,
          syncStatus: 'success',
          lastSyncedAt: new Date().toISOString()
        });
      } else {
        // Just update sync timestamp
        await offerRepository.update(offer.id, {
          syncStatus: 'success',
          lastSyncedAt: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error(`Failed to sync offer ${offerId}:`, error);
      await (offerRepository as any).db.update(offerId, {
        syncStatus: 'error',
        lastSyncedAt: new Date().toISOString()
      });
      return false;
    }
  }

  async syncAllOffersForProduct(productId: string): Promise<void> {
    const offers = await offerRepository.getByProductId(productId);
    for (const offer of offers) {
      await this.syncOffer(offer.id);
    }
  }
}

export const syncService = new SyncService();
