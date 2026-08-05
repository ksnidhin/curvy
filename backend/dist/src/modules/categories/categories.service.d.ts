import { PrismaService } from '../../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(featuredOnly?: boolean, limit?: number): Promise<any>;
    findBySlug(slug: string): Promise<{
        id: any;
        slug: any;
        name: any;
        image: {
            url: any;
            alt: any;
            width: any;
            height: any;
        } | {
            url: string;
            alt: any;
            width?: undefined;
            height?: undefined;
        };
        seo: {
            title: any;
            description: any;
        };
    }>;
    private mapToDto;
}
