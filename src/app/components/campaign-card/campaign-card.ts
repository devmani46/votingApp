import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-campaign-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-card.html',
  styleUrl: './campaign-card.scss',
})
export class CampaignCard {
  @Input() title = 'Default Title';
  @Input() description = 'This is a description text.';
  @Input() image = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
}
