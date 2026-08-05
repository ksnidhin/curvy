import { PrismaService } from '../../prisma/prisma.service';
export declare class HomepageService {
    private prisma;
    constructor(prisma: PrismaService);
    getHomepageConfig(): Promise<{
        heroHeadline: any;
        heroSubtext: any;
        heroImage: any;
        announcementText: any;
        announcementActive: any;
        sectionOrdering: any;
    }>;
}
