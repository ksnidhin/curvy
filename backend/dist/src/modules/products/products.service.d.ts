import { PrismaService } from '../../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(featuredOnly?: boolean, categorySlug?: string, limit?: number): Promise<any>;
    findBySlug(slug: string): Promise<{
        id: any;
        slug: any;
        title: any;
        storeName: any;
        price: number;
        rating: any;
        reviewCount: any;
        images: any;
        categorySlug: any;
        description: any;
        details: any;
        whyWeLoveThis: any;
        affiliateUrl: any;
        seo: {
            title: any;
            description: any;
        };
    }>;
    findRelated(slug: string, limit?: number): Promise<any>;
    private mapToDto;
}
