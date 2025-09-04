import { Component, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FuiField } from '../../components/fui-field/fui-field';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, FuiField, FuiInput, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  form!: FormGroup<LoginForm>;
  submitted = false;

  private adminEmail = 'admin@gmail.com';
  private adminPassword = 'Admin@123';

  constructor(private fb: NonNullableFormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group<LoginForm>({
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      password: this.fb.control('', { validators: [Validators.required] }),
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();

      if (email === this.adminEmail && password === this.adminPassword) {
        localStorage.setItem('role', 'admin');
        this.router.navigate(['/menu']);
        return;
      }

      const moderators = JSON.parse(localStorage.getItem('moderators') || '[]');
      const found = moderators.find(
        (m: any) => m.email === email && m.password === password
      );

      if (found) {
        localStorage.setItem('role', 'moderator');
        this.router.navigate(['/menu']);
        return;
      }

      alert('Invalid email or password');
    } else {
      this.form.markAllAsTouched();
    }
  }

  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
}
