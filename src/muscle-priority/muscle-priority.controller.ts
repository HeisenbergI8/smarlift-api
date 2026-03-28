import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MusclePriorityService } from './muscle-priority.service';
import { UpsertMusclePriorityDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('muscle-priorities')
export class MusclePriorityController {
  constructor(private readonly musclePriorityService: MusclePriorityService) {}

  @Get()
  getUserPriorities(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.musclePriorityService.getUserPriorities(userId, query);
  }

  @Put()
  upsertPriority(
    @CurrentUser('id') userId: number,
    @Body() dto: UpsertMusclePriorityDto,
  ) {
    return this.musclePriorityService.upsertPriority(userId, dto);
  }

  @Delete(':muscleGroupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePriority(
    @CurrentUser('id') userId: number,
    @Param('muscleGroupId', ParseIntPipe) muscleGroupId: number,
  ) {
    return this.musclePriorityService.deletePriority(userId, muscleGroupId);
  }
}
