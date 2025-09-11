import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-detail-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-cards.html',
  styleUrls: ['./detail-cards.scss']
})
export class DetailCards {
  @Input() title!: string;
  @Input() number!: number;
  @Input() description!: string;
  @Input() icon!: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = '#4CAF50';
}
