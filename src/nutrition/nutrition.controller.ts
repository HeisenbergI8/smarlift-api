import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../common';
import { NutritionService } from './nutrition.service';
import {
  CreateNutritionRecDto,
  LogDailyNutritionDto,
  GetDailyLogsQueryDto,
} from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('recommendation')
  getActiveRecommendation(@CurrentUser('id') userId: number) {
    return this.nutritionService.getActiveRecommendation(userId);
  }

  @Post('recommendation')
  @HttpCode(HttpStatus.CREATED)
  createRecommendation(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateNutritionRecDto,
  ) {
    return this.nutritionService.createRecommendation(userId, dto);
  }

  @Post('recommendation/generate')
  @HttpCode(HttpStatus.CREATED)
  generateSmartRecommendation(@CurrentUser('id') userId: number) {
    return this.nutritionService.generateSmartRecommendation(userId);
  }

  @Post('daily-log')
  @HttpCode(HttpStatus.CREATED)
  logDailyNutrition(
    @CurrentUser('id') userId: number,
    @Body() dto: LogDailyNutritionDto,
  ) {
    return this.nutritionService.logDailyNutrition(userId, dto);
  }

  @Get('daily-logs')
  getDailyLogs(
    @CurrentUser('id') userId: number,
    @Query() query: GetDailyLogsQueryDto,
  ) {
    return this.nutritionService.getDailyLogs(userId, query);
  }

  @Get('adjustments')
  getAdjustmentHistory(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.nutritionService.getAdjustmentHistory(userId, query);
  }

  @Post('detect-plateau')
  @HttpCode(HttpStatus.OK)
  detectPlateauAndAdjust(@CurrentUser('id') userId: number) {
    return this.nutritionService.detectPlateauAndAdjust(userId);
  }
}
