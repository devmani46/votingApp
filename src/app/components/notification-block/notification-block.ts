import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-block',
  imports: [DatePipe],
  templateUrl: './notification-block.html',
  styleUrl: './notification-block.scss',
})
export class NotificationBlock {
  @Input() id!: string;
  @Input() type?: string;
  @Input() metadata?: Record<string, any> = {};
  @Input() campaign_title?: string;
  @Input() created_by?: string;
  @Input() start_date?: string;
  @Input() end_date?: string;
  @Input() created_date?: string;

  //for users
  @Input() username?: string;
  @Input() email?: string;
}
