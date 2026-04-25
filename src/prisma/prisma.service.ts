import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly databaseTarget: string;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    const parsedUrl = new URL(databaseUrl);
    const host = parsedUrl.hostname;
    const port = parsedUrl.port || '3306';
    const database = parsedUrl.pathname.replace(/^\//, '') || 'unknown';

    super({
      adapter: new PrismaMariaDb(databaseUrl),
    });

    this.databaseTarget = `${host}:${port}/${database}`;
  }

  async onModuleInit() {
    const maxAttempts = this.getEnvInt('DB_CONNECT_MAX_ATTEMPTS', 3);
    const baseDelayMs = this.getEnvInt('DB_CONNECT_RETRY_DELAY_MS', 500);
    const failFast = this.shouldFailFastOnInit();

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const startedAt = Date.now();

      try {
        await this.$connect();
        await this.$executeRaw(
          Prisma.sql`SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'`,
        );

        const elapsedMs = Date.now() - startedAt;
        this.logger.log(
          `Database connected (attempt ${attempt}/${maxAttempts}, ${elapsedMs}ms, target=${this.databaseTarget})`,
        );
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown database error';
        const retryable = this.isRetryableConnectionError(message);

        this.logger.warn(
          `Initial database connection failed (attempt ${attempt}/${maxAttempts}, target=${this.databaseTarget}, retryable=${retryable}): ${message}`,
        );

        if (attempt < maxAttempts && retryable) {
          const delayMs = baseDelayMs * 2 ** (attempt - 1);
          await this.delay(delayMs);
          continue;
        }

        if (failFast) {
          throw error;
        }

        this.logger.warn(
          'Continuing startup without an active database connection because fail-fast is disabled',
        );
        return;
      }
    }

    if (failFast) {
      throw new Error(
        'Initial database connection failed after all retry attempts',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private getEnvInt(name: string, fallback: number): number {
    const value = process.env[name];

    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed < 1) {
      this.logger.warn(
        `Invalid ${name}=${value}; using fallback ${fallback} instead`,
      );
      return fallback;
    }

    return parsed;
  }

  private shouldFailFastOnInit(): boolean {
    const explicit = process.env.DB_FAIL_FAST_ON_INIT;

    if (explicit) {
      return explicit.toLowerCase() !== 'false';
    }

    return process.env.NODE_ENV === 'production';
  }

  private isRetryableConnectionError(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    return (
      lowerMessage.includes('failed to retrieve a connection from pool') ||
      lowerMessage.includes('connection timeout') ||
      lowerMessage.includes('failed to create socket') ||
      lowerMessage.includes('connect etimedout') ||
      lowerMessage.includes('connect econnrefused') ||
      lowerMessage.includes('sqlstate:08s01')
    );
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
