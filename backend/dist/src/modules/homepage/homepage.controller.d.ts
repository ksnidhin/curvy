import { HomepageService } from './homepage.service';
export declare class HomepageController {
    private readonly homepageService;
    constructor(homepageService: HomepageService);
    getHomepage(): Promise<{
        data: {
            heroHeadline: any;
            heroSubtext: any;
            heroImage: any;
            announcementText: any;
            announcementActive: any;
            sectionOrdering: any;
        };
    }>;
}
