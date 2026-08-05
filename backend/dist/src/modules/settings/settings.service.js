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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalSettings() {
        const settings = await this.prisma.siteSettings.findMany();
        const config = settings.reduce((acc, setting) => {
            acc[setting.key.toLowerCase()] = setting.config_data;
            return acc;
        }, {});
        return {
            siteName: config.branding?.siteName || 'Curvy Girls',
            announcementText: config.branding?.announcementText || 'Free shipping on orders over ₹1999',
            affiliateDisclosureText: config.branding?.affiliateDisclosureText || 'We may earn a commission when you buy through our links.',
            navigation: config.navigation || [
                { label: 'Dresses', href: '/categories/dresses' },
                { label: 'Tops', href: '/categories/tops' },
                { label: 'Jeans', href: '/categories/jeans' },
            ],
            footerLinks: config.footer || [
                {
                    title: 'Shop',
                    links: [{ label: 'All Categories', href: '/categories' }],
                }
            ],
            socialLinks: config.social || [],
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map