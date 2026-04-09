import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Prisma maps MySQL BIGINT to JavaScript BigInt. This ensures BigInt values
// serialize correctly to JSON numbers (safe for IDs within Number.MAX_SAFE_INTEGER).
(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
