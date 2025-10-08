import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

import { NotificationService, Notification } from '../../services/notification';
import { CommonModule } from '@angular/common';
import { NotificationBlock } from '../../components/notification-block/notification-block';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

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

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    console.log('[Component] NotificationsComponent init');
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        console.log('[Component] Notifications data:', data);
        this.notifications = data;
      },
      error: (err) =>
        console.error('[Component] Error fetching notifications:', err),
    });
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
