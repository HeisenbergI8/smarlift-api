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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../common';
import { ProgressionService } from './progression.service';
import { UpdateProgressionSettingsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('progression')
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Get('settings')
  getSettings(@CurrentUser('id') userId: number) {
    return this.progressionService.getSettings(userId);
  }

  @Put('settings')
  updateSettings(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProgressionSettingsDto,
  ) {
    return this.progressionService.upsertSettings(userId, dto);
  }

  @Get('history')
  getHistory(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.progressionService.getHistory(userId, query);
  }

  @Get('history/exercise/:exerciseId')
  getHistoryByExercise(
    @CurrentUser('id') userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.progressionService.getHistoryByExercise(
      userId,
      exerciseId,
      query,
    );
  }

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  evaluateProgression(@CurrentUser('id') userId: number) {
    return this.progressionService.evaluateProgression(userId);
  }
}
