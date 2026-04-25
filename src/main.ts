import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Prisma maps MySQL BIGINT to JavaScript BigInt. This ensures BigInt values
// serialize correctly to JSON numbers (safe for IDs within Number.MAX_SAFE_INTEGER).
(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application started on port ${process.env.PORT ?? 3000}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  const message =
    error instanceof Error ? error.message : 'Unknown startup error';
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(`Application failed to start: ${message}`, stack);
  process.exit(1);
});
