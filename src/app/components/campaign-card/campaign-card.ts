import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-campaign-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-card.html',
  styleUrls: ['./campaign-card.scss'],
})
export class CampaignCard {
  @Input() title = 'Default Title';
  @Input() description = 'This is a description text.';
  @Input() image = '/assets/default.png';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  onDeleteClick(event: MouseEvent) {
    this.delete.emit();
  }

  onCardClick() {
    this.edit.emit();
  }
}
