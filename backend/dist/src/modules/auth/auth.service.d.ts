import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    validateAdmin(email: string, pass: string): Promise<any>;
    seedInitialAdmin(): Promise<void>;
}
