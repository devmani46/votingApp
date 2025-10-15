import { Component, signal, computed, inject } from '@angular/core';
import {
  Validators,
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FuiField } from '../../components/fui-field/fui-field';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { AuthService } from '../../services/auth';

type RegisterForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

function matchFieldsValidator(
  field: keyof RegisterForm,
  matchingField: keyof RegisterForm
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fg = group as FormGroup<RegisterForm>;
    const control = fg.controls[field];
    const matchControl = fg.controls[matchingField];
    if (!control || !matchControl) return null;
    if (!matchControl.value) {
      if (matchControl.errors?.['mismatch']) {
        const { mismatch, ...rest } = matchControl.errors;
        matchControl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    }
    if (control.value !== matchControl.value) {
      matchControl.setErrors({
        ...(matchControl.errors || {}),
        mismatch: true,
      });
      return { mismatch: true };
    } else {
      if (matchControl.errors) {
        const { mismatch, ...rest } = matchControl.errors;
        matchControl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    }
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, FuiField, FuiInput, Button],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);

  form = signal<FormGroup<RegisterForm>>(
    this.fb.group<RegisterForm>(
      {
        firstName: this.fb.control('', Validators.required),
        lastName: this.fb.control('', Validators.required),
        username: this.fb.control('', Validators.required),
        email: this.fb.control('', [Validators.required, Validators.email]),
        password: this.fb.control('', Validators.required),
        confirmPassword: this.fb.control('', Validators.required),
      },
      {
        validators: [matchFieldsValidator('password', 'confirmPassword')],
      }
    )
  );

  submitted = signal<boolean>(false);

  firstName = computed(() => this.form().controls.firstName);
  lastName = computed(() => this.form().controls.lastName);
  username = computed(() => this.form().controls.username);
  email = computed(() => this.form().controls.email);
  password = computed(() => this.form().controls.password);
  confirmPassword = computed(() => this.form().controls.confirmPassword);

  errors = computed(() => ({
    firstName: this.submitted() && this.firstName().hasError('required') ? 'First name is required' : '',
    lastName: this.submitted() && this.lastName().hasError('required') ? 'Last name is required' : '',
    username: this.submitted() && this.username().hasError('required') ? 'Username is required' : '',
    email: this.submitted() && this.email().hasError('required') ? 'Email is required' :
           this.submitted() && this.email().hasError('email') ? 'Invalid email' : '',
    password: this.submitted() && this.password().hasError('required') ? 'Password is required' : '',
    confirmPassword: this.submitted() && this.confirmPassword().hasError('required') ? 'Confirm password is required' :
                     this.submitted() && this.confirmPassword().hasError('mismatch') ? 'Passwords do not match' : ''
  }));

  constructor() {}

  onSubmit() {
    this.submitted.set(true);
    if (this.form().valid) {
      this.auth.register(this.form().getRawValue()).subscribe({
        next: () => {
          console.log('Registration successful');
        },
        error: (err) => {
          console.error('Registration failed:', err);
          alert('Registration failed. User may already exist with this email or username.');
        },
      });
    } else {
      this.form().markAllAsTouched();
    }
  }
}
