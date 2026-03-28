import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EgoLiftService } from './ego-lift.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ego-lift-alerts')
export class EgoLiftController {
  constructor(private readonly egoLiftService: EgoLiftService) {}

  @Get()
  getAlerts(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    // TODO: Delegate to egoLiftService.getAlerts()
  }

  @Get('exercise/:exerciseId')
  getAlertsByExercise(
    @CurrentUser('id') userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    // TODO: Delegate to egoLiftService.getAlertsByExercise()
  }

  @Patch(':id/dismiss')
  dismissAlert(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) alertId: number,
  ) {
    // TODO: Delegate to egoLiftService.dismissAlert()
  }
}
