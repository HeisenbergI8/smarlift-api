import { NotificationService } from './notification.service';
import { UpdateNotificationPrefsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(userId: number, query: PaginationQueryDto): void;
    getUnreadCount(userId: number): void;
    markAsRead(userId: number, notificationId: number): void;
    markAllAsRead(userId: number): void;
    getPreferences(userId: number): void;
    updatePreference(userId: number, dto: UpdateNotificationPrefsDto): void;
}
