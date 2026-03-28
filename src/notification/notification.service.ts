import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPrefsDto } from './dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: number, page: number, limit: number) {
    // TODO: Return paginated notifications for user
    // TODO: Order by createdAt desc
  }

  async getUnreadCount(userId: number) {
    // TODO: Count unread notifications for user
    // TODO: Return { count }
  }

  async markAsRead(userId: number, notificationId: number) {
    // TODO: Verify notification belongs to user
    // TODO: Set is_read = true, read_at = now
    // TODO: Return updated notification
  }

  async markAllAsRead(userId: number) {
    // TODO: Update all unread notifications for user
    // TODO: Return { updated: count }
  }

  async getPreferences(userId: number) {
    // TODO: Return notification preferences for user
  }

  async updatePreference(userId: number, dto: UpdateNotificationPrefsDto) {
    // TODO: Upsert notification preference by userId + type
    // TODO: Return updated preference
  }
}
