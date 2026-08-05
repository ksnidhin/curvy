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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BlogService = class BlogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(limit) {
        const posts = await this.prisma.blogPost.findMany({
            where: {
                status: 'PUBLISHED',
                deleted_at: null,
            },
            include: { cover_media: true },
            orderBy: { published_at: 'desc' },
            take: limit ? Number(limit) : undefined,
        });
        return posts.map((post) => this.mapToDto(post));
    }
    async findBySlug(slug) {
        const post = await this.prisma.blogPost.findFirst({
            where: {
                slug,
                status: 'PUBLISHED',
                deleted_at: null,
            },
            include: { cover_media: true },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Blog post with slug ${slug} not found`);
        }
        return this.mapToDto(post);
    }
    mapToDto(post) {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            date: post.published_at ? post.published_at.toISOString() : post.created_at.toISOString(),
            readTime: post.read_time || '5 min read',
            image: post.cover_media
                ? {
                    url: post.cover_media.optimized_url || post.cover_media.original_url,
                    alt: post.cover_media.alt_text || post.title,
                    width: post.cover_media.width,
                    height: post.cover_media.height,
                }
                : {
                    url: '/images/blog/placeholder.jpg',
                    alt: post.title,
                },
            seo: {
                title: post.seo_title,
                description: post.seo_description,
            },
        };
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map