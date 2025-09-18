import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { CdkTableModule } from '@angular/cdk/table';
import { UserService, User } from '../../services/user';

type SortField = 'firstName' | 'email' | 'username';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FuiInput,
    Button,
    BurgerMenu,
    CdkTableModule,
  ],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'],
})
export class UserManagement implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  users: User[] = [];
  filteredUsers: User[] = [];
  showDialog = false;
  editIndex: number | null = null;

  firstNameControl = new FormControl('', Validators.required);
  lastNameControl = new FormControl('', Validators.required);
  usernameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', Validators.required);

  searchControl = new FormControl('');
  sortField: SortField = 'firstName';
  sortDirection: SortDirection = 'asc';

  displayedColumns: string[] = [
    'username',
    'email',
    'joinDate',
    'session',
    'actions',
  ];

  ngOnInit() {
    this.users = this.userService.getAll();
    this.applyFilters();

    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }

  openDialog(index: number | null = null) {
    this.showDialog = true;
    this.editIndex = index;

    if (index !== null) {
      const user = this.users[index];
      this.firstNameControl.setValue(user.firstName);
      this.lastNameControl.setValue(user.lastName);
      this.usernameControl.setValue(user.username);
      this.emailControl.setValue(user.email);
      this.passwordControl.setValue(user.password);
    } else {
      this.firstNameControl.reset('');
      this.lastNameControl.reset('');
      this.usernameControl.reset('');
      this.emailControl.reset('');
      this.passwordControl.reset('');
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.editIndex = null;
    this.firstNameControl.reset('');
    this.lastNameControl.reset('');
    this.usernameControl.reset('');
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

  saveUser() {
    const user: User = {
      firstName: this.firstNameControl.value ?? '',
      lastName: this.lastNameControl.value ?? '',
      username: this.usernameControl.value ?? '',
      email: this.emailControl.value ?? '',
      password: this.passwordControl.value ?? '',
    };

    if (
      !user.firstName ||
      !user.lastName ||
      !user.username ||
      !user.email ||
      !user.password
    )
      return;

    if (this.editIndex !== null) {
      this.userService.update(this.editIndex, user);
    } else {
      this.userService.add(user);
    }

    this.users = this.userService.getAll();
    this.applyFilters();
    this.closeDialog();
  }

  deleteUser(index: number) {
    this.userService.delete(index);
    this.users = this.userService.getAll();
    this.applyFilters();
  }

  applyFilters() {
    const search = (this.searchControl.value || '').toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );

    this.filteredUsers.sort((a, b) => {
      const valA = a[this.sortField].toLowerCase();
      const valB = b[this.sortField].toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  changeSort(field: SortField) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }
}
