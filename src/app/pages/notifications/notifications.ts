import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

import { NotificationService, Notification } from '../../services/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [BurgerMenu, CommonModule],
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
}
