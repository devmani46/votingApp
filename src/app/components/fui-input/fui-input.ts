import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-fui-input',
  imports: [CommonModule],
  templateUrl: './fui-input.html',
  styleUrls: ['./fui-input.scss'],
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

  value = '';

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
}
