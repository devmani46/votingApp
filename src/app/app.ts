import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FuiField } from './components/fui-field/fui-field';
import { FuiInput } from './components/fui-input/fui-input';
import { Combobox } from './components/combobox/combobox';
import { Country } from './services/country';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTable } from './components/cdk-table/cdk-table';
import { Button } from './components/button/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FuiField,
    FuiInput,
    Combobox,
    CdkTable,
    CdkTableModule,
    Button,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  form!: FormGroup;
  countries: string[] = [];
  selectedCountries: any[] = [];

  constructor(private fb: FormBuilder, private country: Country) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      smallInput: [''],
      mediumInput: ['', Validators.required],
      largeInput: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      noLabel: [''],
      defaultVertical: [''],
      verticalLarge: [''],
      horizontalSmall: [''],
      horizontalLarge: [''],
      disabledField: [{ value: '', disabled: true }],
      countriesControl: [[]],
    });

    this.country.getAllCountryNames().subscribe({
      next: (names) => {
        this.countries = names;
      },
    });
  }

  onCountrySelected(index: number, value: any): void {
    this.selectedCountries[index] = value;
    this.form.patchValue({ countriesControl: this.selectedCountries });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('✅ Form submitted:', this.form.value);
  }

  onReset(): void {
    this.form.reset();
    this.selectedCountries = [];
    console.log('🔄 Form reset');
  }

  onIconAction(): void {
    console.log('⚙️ Icon-only action triggered');
  }

  get f() {
    return this.form.controls;
  }
}
