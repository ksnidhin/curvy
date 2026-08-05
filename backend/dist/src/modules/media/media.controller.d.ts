import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    uploadFile(file: Express.Multer.File, altText?: string): Promise<{
        data: any;
    }>;
    getMedia(): Promise<{
        data: any;
    }>;
}
