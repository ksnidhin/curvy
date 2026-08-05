import { PrismaService } from '../../prisma/prisma.service';
export declare class BlogService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(limit?: number): Promise<any>;
    findBySlug(slug: string): Promise<{
        id: any;
        slug: any;
        title: any;
        excerpt: any;
        content: any;
        date: any;
        readTime: any;
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
