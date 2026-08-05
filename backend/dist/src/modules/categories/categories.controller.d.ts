import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getAll(featured?: string, limit?: number): Promise<{
        data: any;
    }>;
    getBySlug(slug: string): Promise<{
        data: {
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
        };
    }>;
}
