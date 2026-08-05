import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getAll(featured?: string, categorySlug?: string, limit?: number): Promise<{
        data: any;
    }>;
    getBySlug(slug: string): Promise<{
        data: {
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
        };
    }>;
    getRelated(slug: string, limit?: number): Promise<{
        data: any;
    }>;
}
