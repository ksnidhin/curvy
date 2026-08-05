import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        data: {
            siteName: any;
            announcementText: any;
            affiliateDisclosureText: any;
            navigation: any;
            footerLinks: any;
            socialLinks: any;
        };
    }>;
}
