import { SiteSettings } from "../types/settings";
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface ISettingsRepository {
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings>;
}

export class SettingsRepository implements ISettingsRepository {
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data) as SiteSettings;
    } catch (error: any) {
      const defaultSettings = {
        siteName: "Lively",
        announcementText: "Welcome to Lively!",
        navigation: [],
        footerLinks: [],
        socialLinks: {
          facebook: "#",
          instagram: "#",
          twitter: "#"
        }
      } as any;
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
      return defaultSettings;
    }
  }

  async updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const updated = { ...current, ...data };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
