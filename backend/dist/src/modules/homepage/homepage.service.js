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
exports.HomepageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let HomepageService = class HomepageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomepageConfig() {
        const config = await this.prisma.homepageConfig.findFirst({
            include: { hero_media: true },
            orderBy: { updated_at: 'desc' },
        });
        if (!config) {
            return {
                heroHeadline: 'Curated Fashion for Every Body',
                heroSubtext: 'Discover our handpicked collection of inclusive styles.',
                heroImage: '/images/hero/hero-placeholder.jpg',
                announcementText: '',
                announcementActive: false,
                sectionOrdering: ['categories', 'featured', 'blog'],
            };
        }
        return {
            heroHeadline: config.hero_headline,
            heroSubtext: config.hero_subtext,
            heroImage: config.hero_media ? (config.hero_media.optimized_url || config.hero_media.original_url) : '/images/hero/hero-placeholder.jpg',
            announcementText: config.announcement_text,
            announcementActive: config.announcement_active,
            sectionOrdering: config.section_ordering || ['categories', 'featured', 'blog'],
        };
    }
};
exports.HomepageService = HomepageService;
exports.HomepageService = HomepageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HomepageService);
//# sourceMappingURL=homepage.service.js.map