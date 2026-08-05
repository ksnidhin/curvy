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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(featuredOnly, limit) {
        const where = {
            is_visible: true,
            deleted_at: null,
            ...(featuredOnly ? { is_featured: true } : {}),
        };
        const categories = await this.prisma.category.findMany({
            where,
            include: { media: true },
            orderBy: { sort_order: 'asc' },
            take: limit ? Number(limit) : undefined,
        });
        return categories.map((cat) => this.mapToDto(cat));
    }
    async findBySlug(slug) {
        const category = await this.prisma.category.findFirst({
            where: {
                slug,
                is_visible: true,
                deleted_at: null,
            },
            include: { media: true },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with slug ${slug} not found`);
        }
        return this.mapToDto(category);
    }
    mapToDto(category) {
        return {
            id: category.id,
            slug: category.slug,
            name: category.name,
            image: category.media
                ? {
                    url: category.media.optimized_url || category.media.original_url,
                    alt: category.media.alt_text || category.name,
                    width: category.media.width,
                    height: category.media.height,
                }
                : {
                    url: '/images/categories/placeholder.jpg',
                    alt: category.name,
                },
            seo: {
                title: category.seo_title,
                description: category.seo_description,
            },
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map