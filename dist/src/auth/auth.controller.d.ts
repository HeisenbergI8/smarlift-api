import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: bigint;
            email: string;
            firstName: string;
            lastName: string;
            isCoachMode: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: bigint;
            email: string;
            firstName: string;
            lastName: string;
            isCoachMode: boolean;
        };
    }>;
}
