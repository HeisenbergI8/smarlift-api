import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('database')
  async checkDatabase() {
    const result = await this.healthService.checkDatabase();

    if (!result.connected) {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
}
