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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const prisma_service_1 = require("../../prisma/prisma.service");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
let MediaService = class MediaService {
    prisma;
    s3Client;
    bucketName;
    constructor(prisma) {
        this.prisma = prisma;
        this.bucketName = process.env.AWS_S3_BUCKET || 'curvygirls-media';
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
            },
        });
    }
    async uploadImage(file, altText) {
        try {
            const image = (0, sharp_1.default)(file.buffer);
            const metadata = await image.metadata();
            const optimizedBuffer = await image
                .webp({ quality: 80 })
                .toBuffer();
            const filename = `${(0, uuid_1.v4)()}.webp`;
            const originalFilename = file.originalname;
            await this.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: filename,
                Body: optimizedBuffer,
                ContentType: 'image/webp',
            }));
            const cdnUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
            const media = await this.prisma.media.create({
                data: {
                    filename: filename,
                    original_url: cdnUrl,
                    optimized_url: cdnUrl,
                    alt_text: altText || originalFilename,
                    width: metadata.width,
                    height: metadata.height,
                    mime_type: 'image/webp',
                    size_bytes: optimizedBuffer.length,
                },
            });
            return media;
        }
        catch (error) {
            console.error('Error uploading image:', error);
            throw new common_1.InternalServerErrorException('Failed to process and upload image');
        }
    }
    async getAllMedia() {
        return this.prisma.media.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map