import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateNutritionRecDto, LogDailyNutritionDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('recommendation')
  getActiveRecommendation(@CurrentUser('id') userId: number) {
    // TODO: Delegate to nutritionService.getActiveRecommendation()
  }

  @Post('recommendation')
  createRecommendation(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateNutritionRecDto,
  ) {
    // TODO: Delegate to nutritionService.createRecommendation()
  }

  @Post('recommendation/generate')
  generateSmartRecommendation(@CurrentUser('id') userId: number) {
    // TODO: Delegate to nutritionService.generateSmartRecommendation()
  }

  @Post('daily-log')
  logDailyNutrition(
    @CurrentUser('id') userId: number,
    @Body() dto: LogDailyNutritionDto,
  ) {
    // TODO: Delegate to nutritionService.logDailyNutrition()
  }

  @Get('daily-logs')
  getDailyLogs(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Delegate to nutritionService.getDailyLogs()
  }

  @Get('adjustments')
  getAdjustmentHistory(@CurrentUser('id') userId: number) {
    // TODO: Delegate to nutritionService.getAdjustmentHistory()
  }

  @Post('detect-plateau')
  detectPlateauAndAdjust(@CurrentUser('id') userId: number) {
    // TODO: Delegate to nutritionService.detectPlateauAndAdjust()
  }
}
