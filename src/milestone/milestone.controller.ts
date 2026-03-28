import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Get()
  getAllMilestones() {
    // TODO: Delegate to milestoneService.getAllMilestones()
  }

  @Get('me')
  getUserMilestones(@CurrentUser('id') userId: number) {
    // TODO: Delegate to milestoneService.getUserMilestones()
  }

  @Post('check')
  checkAndAward(@CurrentUser('id') userId: number) {
    // TODO: Delegate to milestoneService.checkAndAwardMilestones()
  }
}
