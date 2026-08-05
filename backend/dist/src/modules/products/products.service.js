"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(featuredOnly, categorySlug, limit) {
        const where = {
            is_visible: true,
            deleted_at: null,
        };
        if (featuredOnly) {
            where.is_featured = true;
        }
        if (categorySlug) {
            where.category = { slug: categorySlug };
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: true,
                store: { include: { logo: true } },
                images: {
                    include: { media: true },
                    orderBy: { sort_order: 'asc' },
                },
            },
            orderBy: { sort_order: 'asc' },
            take: limit ? Number(limit) : undefined,
        });
        return products.map((prod) => this.mapToDto(prod));
    }
    async findBySlug(slug) {
        const product = await this.prisma.product.findFirst({
            where: {
                slug,
                is_visible: true,
                deleted_at: null,
            },
            include: {
                category: true,
                store: { include: { logo: true } },
                images: {
                    include: { media: true },
                    orderBy: { sort_order: 'asc' },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with slug ${slug} not found`);
        }
        return this.mapToDto(product);
    }
    async findRelated(slug, limit = 4) {
        const product = await this.prisma.product.findFirst({
            where: { slug, is_visible: true, deleted_at: null },
            select: { category_id: true, id: true },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with slug ${slug} not found`);
        }
        const related = await this.prisma.product.findMany({
            where: {
                category_id: product.category_id,
                id: { not: product.id },
                is_visible: true,
                deleted_at: null,
            },
            include: {
                category: true,
                store: { include: { logo: true } },
                images: {
                    include: { media: true },
                    orderBy: { sort_order: 'asc' },
                },
            },
            take: Number(limit),
        });
        return related.map((prod) => this.mapToDto(prod));
    }
    mapToDto(product) {
        const affiliateUrl = product.external_product_url;
        return {
            id: product.id,
            slug: product.slug,
            title: product.title,
            storeName: product.store.name,
            price: Number(product.price),
            rating: product.rating,
            reviewCount: product.review_count,
            images: product.images.length > 0
                ? product.images.map((pi) => ({
                    url: pi.media.optimized_url || pi.media.original_url,
                    alt: pi.media.alt_text || product.title,
                    width: pi.media.width,
                    height: pi.media.height,
                }))
                : [
                    {
                        url: '/images/products/placeholder.jpg',
                        alt: product.title,
                    },
                ],
            categorySlug: product.category.slug,
            description: product.description,
            details: product.details,
            whyWeLoveThis: product.why_we_love_this,
            affiliateUrl,
            seo: {
                title: product.seo_title,
                description: product.seo_description,
            },
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map