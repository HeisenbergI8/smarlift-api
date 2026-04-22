import { Notification_type } from '@prisma/client';

export interface NotificationResponse {
  id: number;
  userId: number;
  type: Notification_type;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  readAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
}

export interface NotificationPreferenceResponse {
  id: number;
  userId: number;
  type: Notification_type;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnreadCountResponse {
  count: number;
}

export interface PaginatedNotificationsResponse {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface MarkAllReadResponse {
  updated: number;
}
