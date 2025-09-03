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
  @Input() id!: number;
  @Input() title = 'Default Title';
  @Input() description = 'This is a description text.';
  @Input() image = '/assets/default.png';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;

  @Output() deleteCampaignEvent = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    if (confirm(`Delete campaign "${this.title}"?`)) {
      this.deleteCampaignEvent.emit(this.id);
    }
  }

  onCardClick() {
    this.edit.emit(this.id);
  }
}
