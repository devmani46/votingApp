import {
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class ButtonComponent {
  @Input() appearance:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'subtle'
    | 'transparent' = 'secondary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() shape: 'rounded' | 'square' | 'circular' = 'rounded';
  @Input() disabled = false;
  @Input() iconOnly = false;

  @HostBinding('class')
  get classes(): string {
    return `
    btn
    btn--${this.appearance}
    btn--${this.size}
    btn--${this.shape}
    ${this.disabled ? 'disabled' : ''}
    ${this.iconOnly ? 'icon-only' : ''}
    ;`;
  }
}
