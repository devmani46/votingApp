import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FuiInput, Button, BurgerMenu],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagement implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  moderators: any[] = [];
  users: any[] = [];

  showDialog = false;
  editIndex: number | null = null;

  nameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', Validators.required);

  ngOnInit() {
    const savedMods = localStorage.getItem('moderators');
    this.moderators = savedMods ? JSON.parse(savedMods) : [];

    // load users (later from backend)
    const savedUsers = localStorage.getItem('users');
    this.users = savedUsers ? JSON.parse(savedUsers) : [];

    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }

  openDialog(index: number | null = null) {
    this.showDialog = true;
    this.editIndex = index;

    if (index !== null) {
      const mod = this.moderators[index];
      this.nameControl.setValue(mod.name);
      this.emailControl.setValue(mod.email);
      this.passwordControl.setValue(mod.password);
    } else {
      this.nameControl.reset('');
      this.emailControl.reset('');
      this.passwordControl.reset('');
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.editIndex = null;
    this.nameControl.reset('');
    this.emailControl.reset('');
    this.passwordControl.reset('');
  }

  handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.showDialog) {
      this.closeDialog();
    }
  };

  closeDialogOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  saveModerator() {
    const moderator = {
      name: this.nameControl.value ?? '',
      email: this.emailControl.value ?? '',
      password: this.passwordControl.value ?? ''
    };

    if (!moderator.name || !moderator.email || !moderator.password) return;

    if (this.editIndex !== null) {
      this.moderators[this.editIndex] = moderator;
    } else {
      this.moderators.push(moderator);
    }

    this.save();
    this.closeDialog();
  }

  deleteModerator(index: number) {
    this.moderators.splice(index, 1);
    this.save();
  }

  private save() {
    localStorage.setItem('moderators', JSON.stringify(this.moderators));
  }
}
