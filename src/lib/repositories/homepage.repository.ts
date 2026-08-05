import { fetchApi } from "../api";

export interface HomepageConfig {
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  announcementText: string;
  announcementActive: boolean;
  sectionOrdering: string[];
}

export interface IHomepageRepository {
  getHomepageConfig(): Promise<HomepageConfig>;
}

export class HomepageRepository implements IHomepageRepository {
  async getHomepageConfig(): Promise<HomepageConfig> {
    return fetchApi<HomepageConfig>('/homepage');
  }
}

export const homepageRepository = new HomepageRepository();
