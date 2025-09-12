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
  @Input() title!: string;
  @Input() description!: string;
  @Input() icon!: string;
  @Input() number?: number;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
