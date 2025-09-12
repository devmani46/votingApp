import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-cards.html',
  styleUrls: ['./detail-cards.scss']
})
export class DetailCards {
  @Input() title: string = '';

  @Input() number?: number | string;

  @Input() description: string = '';

  @Input() icon: string = '';

  @Input() size: 'small' | 'large' = 'small';

  @Input() color: string = '#2196F3';
}
