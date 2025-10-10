import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

import { NotificationService, Notification } from '../../services/notification';
import { CommonModule } from '@angular/common';
import { NotificationBlock } from '../../components/notification-block/notification-block';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    BurgerMenu,
    CommonModule,
    NotificationBlock,
    MatPaginatorModule,
    MatPaginator,
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    console.log('[Component] NotificationsComponent init');
    this.socketService.connect();
    this.socketService.joinAdmin();
    this.socketService.setNotificationsActive(true);
    this.socketService.resetUnreadCount();

    this.socketService.onNotification().subscribe((notif: Notification) => {
      // Avoid duplicates
      if (!this.notifications.find((n) => n.id === notif.id)) {
        this.notifications.unshift(notif);
      }
    });
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        // Merge API and real-time notifications
        const existingIds = new Set(this.notifications.map((n) => n.id));
        const newNotifications = data.filter((n) => !existingIds.has(n.id));
        this.notifications = [...newNotifications, ...this.notifications];
      },
      error: (err) =>
        console.error('[Component] Error fetching notifications:', err),
    });
  }

  ngOnDestroy() {
    this.socketService.setNotificationsActive(false);
  }

  pageSize = 10;
  currentPage = 0;

  pagedNotifications() {
    const all = this.notifications;
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return all.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }
}
