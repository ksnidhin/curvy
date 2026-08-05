import { PrismaService } from '../../prisma/prisma.service';
export declare class MediaService {
    private prisma;
    private s3Client;
    private bucketName;
    constructor(prisma: PrismaService);
    uploadImage(file: Express.Multer.File, altText?: string): Promise<any>;
    getAllMedia(): Promise<any>;
}
