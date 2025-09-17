import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-fui-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fui-input.html',
  styleUrl: './fui-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FuiInput),
      multi: true,
    },
  ],
})
export class FuiInput implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() invalid = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() type: 'text' | 'password' = 'text';
  @Input() allowGenerate = true;
  @Input() allowStrength = true;

  value = '';
  showPassword = false;

  private onChange = (val: string) => {};
  onTouched = () => {};

  writeValue(val: any): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  generatePassword() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.value = pwd;
    this.onChange(pwd);
  }

  getPasswordStrength(): string {
    if (this.type !== 'password') return '';
    const val = this.value;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNum = /[0-9]/.test(val);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    const longEnough = val.length >= 8;

    if (longEnough && hasUpper && hasLower && hasNum && hasSpecial) return 'Strong';
    if (longEnough && ((hasUpper && hasLower) || hasNum || hasSpecial)) return 'Medium';
    if (val.length > 0) return 'Weak';
    return '';
  }
}
