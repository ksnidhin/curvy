import { BlogService } from './blog.service';
export declare class BlogController {
    private readonly blogService;
    constructor(blogService: BlogService);
    getAll(limit?: number): Promise<{
        data: any;
    }>;
    getBySlug(slug: string): Promise<{
        data: {
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
        };
    }>;
}
