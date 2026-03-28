import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UpdateNotificationPrefsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    // TODO: Delegate to notificationService.getNotifications()
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('id') userId: number) {
    // TODO: Delegate to notificationService.getUnreadCount()
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    // TODO: Delegate to notificationService.markAsRead()
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('id') userId: number) {
    // TODO: Delegate to notificationService.markAllAsRead()
  }

  @Get('preferences')
  getPreferences(@CurrentUser('id') userId: number) {
    // TODO: Delegate to notificationService.getPreferences()
  }

  @Put('preferences')
  updatePreference(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    // TODO: Delegate to notificationService.updatePreference()
  }
}
