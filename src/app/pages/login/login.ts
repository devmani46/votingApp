import { Component, signal, computed } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FuiField } from '../../components/fui-field/fui-field';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { AuthService } from '../../services/auth';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, FuiField, FuiInput, Button],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  form = signal<FormGroup<LoginForm>>(
    this.fb.group<LoginForm>({
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      password: this.fb.control('', { validators: [Validators.required] }),
      rememberMe: this.fb.control(false),
    })
  );

  submitted = signal<boolean>(false);

  email = computed(() => this.form().controls.email);
  password = computed(() => this.form().controls.password);
  rememberMe = computed(() => this.form().controls.rememberMe);

  emailError = computed(() => {
    if (!this.submitted()) return '';
    if (this.email().hasError('required')) return 'Email is required';
    if (this.email().hasError('email')) return 'Invalid email';
    return '';
  });

  passwordError = computed(() =>
    this.submitted() && this.password().hasError('required')
      ? 'Password is required'
      : ''
  );

  constructor(private fb: NonNullableFormBuilder, private auth: AuthService) {}

  onSubmit() {
    this.submitted.set(true);
    if (this.form().valid) {
      const { email, password, rememberMe } = this.form().getRawValue();
      this.auth.login(email, password, rememberMe).subscribe({
        next: (success) => {
          if (!success) {
            alert('Invalid email or password');
          } else {
            if (rememberMe) {
              localStorage.setItem('rememberMe', 'true');
            } else {
              localStorage.removeItem('rememberMe');
            }
          }
        },
        error: (err) => {
          console.error('Login failed:', err);
          alert('Login failed. Please check your credentials.');
        },
      });
    } else {
      this.form().markAllAsTouched();
    }
  }
}
