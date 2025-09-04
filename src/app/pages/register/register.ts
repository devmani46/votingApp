import { Component, OnInit } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { FuiField } from '../../components/fui-field/fui-field';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';

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
export class Register implements OnInit {
  form!: FormGroup<RegisterForm>;
  submitted = false;

  constructor(private fb: NonNullableFormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group<RegisterForm>(
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
    );
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      const newUser = this.form.getRawValue();
      console.log('Register data:', newUser);

      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      localStorage.setItem('currentUser', JSON.stringify(newUser));

      this.router.navigate(['/login']);
    } else {
      this.form.markAllAsTouched();
    }
  }

  get firstName() {
    return this.form.controls.firstName;
  }
  get lastName() {
    return this.form.controls.lastName;
  }
  get username() {
    return this.form.controls.username;
  }
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }
}
