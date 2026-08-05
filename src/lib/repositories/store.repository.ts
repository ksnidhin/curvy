import { AffiliateStore } from "../types/product-advanced";
import { JsonDatabase } from "../json-db";

export class StoreRepository {
  private db: JsonDatabase<AffiliateStore>;

  constructor() {
    this.db = new JsonDatabase<AffiliateStore>('stores.json');
  }

  async getAll(): Promise<AffiliateStore[]> {
    return this.db.getAll();
  }

  async getById(id: string): Promise<AffiliateStore | null> {
    return this.db.getById(id);
  }

  async create(data: Omit<AffiliateStore, "id">): Promise<AffiliateStore> {
    return this.db.create(data);
  }

  async update(id: string, data: Partial<AffiliateStore>): Promise<AffiliateStore | null> {
    return this.db.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id);
  }
}

export const storeRepository = new StoreRepository();
