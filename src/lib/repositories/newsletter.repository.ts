import { MockNewsletterProvider } from "../providers/mock-newsletter.provider";

export interface INewsletterRepository {
  subscribe(email: string): Promise<boolean>;
}

export class NewsletterRepository implements INewsletterRepository {
  private provider: MockNewsletterProvider;

  constructor() {
    this.provider = new MockNewsletterProvider();
  }

  async subscribe(email: string): Promise<boolean> {
    return this.provider.subscribe(email);
  }
}

export const newsletterRepository = new NewsletterRepository();
