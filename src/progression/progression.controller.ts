import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { UpdateProgressionSettingsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('progression')
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Get('settings')
  getSettings(@CurrentUser('id') userId: number) {
    // TODO: Delegate to progressionService.getSettings()
  }

  @Put('settings')
  updateSettings(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProgressionSettingsDto,
  ) {
    // TODO: Delegate to progressionService.upsertSettings()
  }

  @Get('history')
  getHistory(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    // TODO: Delegate to progressionService.getHistory()
  }

  @Get('history/exercise/:exerciseId')
  getHistoryByExercise(
    @CurrentUser('id') userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    // TODO: Delegate to progressionService.getHistoryByExercise()
  }

  @Post('evaluate')
  evaluateProgression(@CurrentUser('id') userId: number) {
    // TODO: Delegate to progressionService.evaluateProgression()
  }
}
