import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, FuiField, FuiInput, Button],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  form: FormGroup<LoginForm>;
  submitted = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group<LoginForm>({
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      password: this.fb.control('', { validators: [Validators.required] }),
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      const success = this.auth.login(email, password);

      if (!success) {
        alert('Invalid email or password');
      }
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
