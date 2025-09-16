import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-card',
  standalone: true,
  templateUrl: './campaign-card.html',
  styleUrls: ['./campaign-card.scss'],
  imports: [CommonModule],
})
export class CampaignCard {
  @Input() id!: number;
  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;

  @Output() deleteCampaignEvent = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.deleteCampaignEvent.emit(this.id);
  }

  onCardClick() {
    this.edit.emit(this.id);
  }
}
