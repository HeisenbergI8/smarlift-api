import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MuscleGroupService } from './muscle-group.service';
import {
  FindMuscleGroupsQueryDto,
  CreateMuscleGroupDto,
  UpdateMuscleGroupDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../common';

@Controller('muscle-groups')
export class MuscleGroupController {
  constructor(private readonly muscleGroupService: MuscleGroupService) {}

  @Get()
  findAll(@Query() query: FindMuscleGroupsQueryDto) {
    return this.muscleGroupService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMuscleGroupDto) {
    return this.muscleGroupService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMuscleGroupDto,
  ) {
    return this.muscleGroupService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.muscleGroupService.remove(id);
  }
}
