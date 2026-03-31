import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, CurrentUser } from '../common';
import {
  GetWeightTrendQueryDto,
  GetWorkoutConsistencyQueryDto,
  GetNutritionAdherenceQueryDto,
  GetKpiSnapshotsQueryDto,
} from './dto';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@CurrentUser('id') userId: number) {
    return this.dashboardService.getOverview(userId);
  }

  @Get('strength-progress')
  getStrengthProgress(@CurrentUser('id') userId: number) {
    return this.dashboardService.getStrengthProgress(userId);
  }

  @Get('weight-trend')
  getWeightTrend(
    @CurrentUser('id') userId: number,
    @Query() query: GetWeightTrendQueryDto,
  ) {
    return this.dashboardService.getWeightTrend(userId, query.period);
  }

  @Get('workout-consistency')
  getWorkoutConsistency(
    @CurrentUser('id') userId: number,
    @Query() query: GetWorkoutConsistencyQueryDto,
  ) {
    return this.dashboardService.getWorkoutConsistency(userId, query.weeks);
  }

  @Get('nutrition-adherence')
  getNutritionAdherence(
    @CurrentUser('id') userId: number,
    @Query() query: GetNutritionAdherenceQueryDto,
  ) {
    return this.dashboardService.getNutritionAdherence(userId, query.days);
  }

  @Get('kpi-snapshots')
  getKpiSnapshots(
    @CurrentUser('id') userId: number,
    @Query() query: GetKpiSnapshotsQueryDto,
  ) {
    return this.dashboardService.getKpiSnapshots(userId, query);
  }

  @Post('kpi-snapshot')
  @HttpCode(HttpStatus.OK)
  createKpiSnapshot(@CurrentUser('id') userId: number) {
    return this.dashboardService.createKpiSnapshot(userId);
  }
}
