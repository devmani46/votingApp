import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { Button } from '../../components/button/button';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Combobox } from '../../components/combobox/combobox';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBar, Footer, Button, FuiInput, Combobox],
  templateUrl: './user-page.html',
  styleUrls: ['./user-page.scss']
})
export class UserPage implements OnInit {
  private fb = inject(FormBuilder);

  user: any = {
    photo: '',
    firstName: '',
    lastName: '',
    username: '',
    age: '',
    dob: '',
    country: '',
    email: ''
  };

  form!: FormGroup;
  showDialog = false;
  photoPreview: string | null = null;

  countries = ['Nepal', 'India', 'USA', 'UK', 'Australia', 'Canada'];

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    if (!this.user.photo) {
      this.user.photo = '/assets/admin.png';
    }

    this.form = this.fb.group({
      firstName: [this.user.firstName || '', Validators.required],
      lastName: [this.user.lastName || '', Validators.required],
      username: [this.user.username || '', Validators.required],
      dob: [this.user.dob || '', Validators.required],
      country: [this.user.country || '', Validators.required],
      email: [this.user.email || '', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
    });

    this.photoPreview = this.user.photo;
  }

  openDialog() {
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
  }

  closeDialogOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCountryChange(value: string | string[]) {
    const country = Array.isArray(value) ? value[0] : value;
    this.form.patchValue({ country });
  }

  updateAge() {
    const dob = this.form.value.dob;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.user.age = age;
    }
  }

  saveProfile() {
    if (this.form.invalid) return;

    if (this.form.value.password || this.form.value.confirmPassword) {
      if (this.form.value.password !== this.form.value.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    this.user = {
      ...this.user,
      ...this.form.value,
      photo: this.photoPreview || this.user.photo,
      age: this.user.age,
      password: this.form.value.password
        ? this.form.value.password
        : this.user.password,
    };

    localStorage.setItem('currentUser', JSON.stringify(this.user));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex((u: any) => u.email === this.user.email);
    if (idx > -1) {
      users[idx] = this.user;
      localStorage.setItem('users', JSON.stringify(users));
    }

    window.dispatchEvent(new StorageEvent('storage', { key: 'currentUser' }));

    this.form.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      username: this.user.username,
      dob: this.user.dob,
      country: this.user.country,
      email: this.user.email,
      password: '',
      confirmPassword: ''
    });

    this.closeDialog();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.showDialog) return;

    if (event.key === 'Escape') {
      this.closeDialog();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveProfile();
    }
  }
}
