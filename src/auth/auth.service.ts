import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { AccountType } from './dto/register.dto';

const BCRYPT_SALT_ROUNDS = 12;
const ALLOWED_SELF_REGISTER_ROLES: readonly AccountType[] = [
  AccountType.USER,
  AccountType.COACH,
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const requestedRole: AccountType = dto.accountType ?? AccountType.USER;
    if (!ALLOWED_SELF_REGISTER_ROLES.includes(requestedRole)) {
      throw new ForbiddenException('Invalid account type');
    }

    const role = await this.prisma.role.findFirst({
      where: { name: requestedRole },
    });
    if (!role) {
      this.logger.error(`Role "${requestedRole}" not found in database`);
      throw new InternalServerErrorException('An unexpected error occurred');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isCoachMode: dto.isCoachMode ?? false,
        role: { connect: { id: role.id } },
        profile: { create: {} },
      },
    });

    this.logger.log(`User registered: ${user.email}`);

    return {
      accessToken: this.generateToken(
        Number(user.id),
        user.email,
        Number(user.roleId),
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isCoachMode: user.isCoachMode,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: this.generateToken(
        Number(user.id),
        user.email,
        Number(user.roleId),
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isCoachMode: user.isCoachMode,
      },
    };
  }

  private generateToken(userId: number, email: string, roleId: number): string {
    return this.jwtService.sign({ sub: userId, email, roleId });
  }
}
