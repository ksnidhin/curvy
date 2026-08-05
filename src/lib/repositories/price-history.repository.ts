import { PriceHistory } from "../types/product-advanced";
import { JsonDatabase } from "../json-db";

export class PriceHistoryRepository {
  private db: JsonDatabase<PriceHistory>;

  constructor() {
    this.db = new JsonDatabase<PriceHistory>('price_history.json');
  }

  async getByOfferId(offerId: string): Promise<PriceHistory[]> {
    const all = await this.db.getAll();
    return all.filter(h => h.offerId === offerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async create(data: Omit<PriceHistory, "id">): Promise<PriceHistory> {
    return this.db.create(data);
  }

  async deleteByProductId(productId: string): Promise<void> {
    const all = await this.db.getAll();
    const filtered = all.filter(h => h.productId !== productId);
    if (filtered.length !== all.length) {
      await this.db.write(filtered);
    }
  }
}

export const priceHistoryRepository = new PriceHistoryRepository();
