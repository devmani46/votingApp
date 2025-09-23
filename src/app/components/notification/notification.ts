import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification {
  @Input() id!: string;
  @Input() title!: string;
}
