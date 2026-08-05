import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: Record<string, any>, req: Request): Promise<{
        data: {
            message: string;
            user: any;
        };
    }>;
    logout(req: Request, res: Response): Promise<unknown>;
}
