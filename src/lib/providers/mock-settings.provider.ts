import { settings } from "../../../mock/settings";
import { SiteSettings } from "../types/settings";

export class MockSettingsProvider {
  async getSiteSettings(): Promise<SiteSettings> {
    return settings;
  }
}
