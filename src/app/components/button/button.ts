import {
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Button {
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

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get classes(): string {
    return `
      btn
      btn--${this.appearance}
      btn--${this.size}
      btn--${this.shape}
      ${this.disabled ? 'disabled' : ''}
      ${this.iconOnly ? 'icon-only' : ''}
    `.trim();
  }
}
