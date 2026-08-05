export class MockNewsletterProvider {
  private subscribers: string[] = [];

  async subscribe(email: string): Promise<boolean> {
    if (this.subscribers.includes(email)) {
      return false; // Already subscribed
    }
    this.subscribers.push(email);
    return true;
  }
}
