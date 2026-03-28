import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@CurrentUser('id') userId: number) {
    // TODO: Delegate to dashboardService.getOverview()
  }

  @Get('strength-progress')
  getStrengthProgress(@CurrentUser('id') userId: number) {
    // TODO: Delegate to dashboardService.getStrengthProgress()
  }

  @Get('weight-trend')
  getWeightTrend(
    @CurrentUser('id') userId: number,
    @Query('period') period: string,
  ) {
    // TODO: Delegate to dashboardService.getWeightTrend()
  }

  @Get('workout-consistency')
  getWorkoutConsistency(
    @CurrentUser('id') userId: number,
    @Query('weeks') weeks: number,
  ) {
    // TODO: Delegate to dashboardService.getWorkoutConsistency()
  }

  @Get('nutrition-adherence')
  getNutritionAdherence(
    @CurrentUser('id') userId: number,
    @Query('days') days: number,
  ) {
    // TODO: Delegate to dashboardService.getNutritionAdherence()
  }

  @Get('kpi-snapshots')
  getKpiSnapshots(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Delegate to dashboardService.getKpiSnapshots()
  }

  @Post('kpi-snapshot')
  createKpiSnapshot(@CurrentUser('id') userId: number) {
    // TODO: Delegate to dashboardService.createKpiSnapshot()
  }
}
