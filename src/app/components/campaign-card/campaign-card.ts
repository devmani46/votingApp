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
  @Input() id!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() deleted = false;

  @Input() showKebabMenu = false;
  @Input() showEditOption = false;
  @Input() showDeleteOption = false;

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() cardClick = new EventEmitter<string>();

  isKebabMenuOpen = false;

  onCardClick() {
    if (!this.isKebabMenuOpen) {
      this.cardClick.emit(this.id);
    }
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.id);
  }

  // Kebab menu methods
  toggleKebabMenu(event: Event) {
    event.stopPropagation();
    this.isKebabMenuOpen = !this.isKebabMenuOpen;
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.id);
    this.isKebabMenuOpen = false;
  }

  onDeleteFromMenu(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.id);
    this.isKebabMenuOpen = false;
  }

  // Close kebab menu when clicking outside
  closeKebabMenu() {
    this.isKebabMenuOpen = false;
  }
}
