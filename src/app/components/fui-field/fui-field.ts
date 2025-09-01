import { Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

type MessageType = 'fw-error' | 'fw-success' | 'fw-warning';
interface FieldMessage {
  type: MessageType;
  text: string;
  icon?: string;
}

@Component({
  selector: 'app-fui-field',
  imports: [CommonModule, NgClass],
  templateUrl: './fui-field.html',
  styleUrls: ['./fui-field.scss'],
})
export class FuiField {
  @Input() label = '';
  @Input() horizontal = false;
  @Input() noLabel = false;
  @Input() required = false;
  @Input() labelSize: 'default' | 'vertical-large' | 'horizontal-small' | 'horizontal-large' = 'default';

  @Input() hint = '';
  @Input() message?: FieldMessage;

  @Input() errorMessage = '';
  @Input() successMessage = '';
  @Input() warningMessage = '';

  @Input() errorIcon = '';
  @Input() successIcon = '';
  @Input() warningIcon = '';
}
