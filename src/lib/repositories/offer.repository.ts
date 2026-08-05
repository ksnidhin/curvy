import { ProductOffer } from "../types/product-advanced";
import { JsonDatabase } from "../json-db";

export class OfferRepository {
  private db: JsonDatabase<ProductOffer>;

  constructor() {
    this.db = new JsonDatabase<ProductOffer>('product_offers.json');
  }

  async getByProductId(productId: string): Promise<ProductOffer[]> {
    const all = await this.db.getAll();
    return all.filter(o => o.productId === productId);
  }

  async create(data: Omit<ProductOffer, "id">): Promise<ProductOffer> {
    return this.db.create(data);
  }

  async update(id: string, data: Partial<ProductOffer>): Promise<ProductOffer | null> {
    return this.db.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id);
  }

  async deleteByProductId(productId: string): Promise<void> {
    const all = await this.db.getAll();
    const filtered = all.filter(o => o.productId !== productId);
    if (filtered.length !== all.length) {
      await this.db.write(filtered);
    }
  }
}

export const offerRepository = new OfferRepository();
