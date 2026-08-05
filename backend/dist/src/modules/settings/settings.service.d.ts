import { PrismaService } from '../../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getGlobalSettings(): Promise<{
        siteName: any;
        announcementText: any;
        affiliateDisclosureText: any;
        navigation: any;
        footerLinks: any;
        socialLinks: any;
    }>;
}
