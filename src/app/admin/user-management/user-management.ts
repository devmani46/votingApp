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

type SortField = 'first_name' | 'email' | 'username';
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
  editId: string | null = null;

  firstNameControl = new FormControl('', Validators.required);
  lastNameControl = new FormControl('', Validators.required);
  usernameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', Validators.required);

  searchControl = new FormControl('');
  sortField: SortField = 'first_name';
  sortDirection: SortDirection = 'asc';

  displayedColumns: string[] = [
    'username',
    'email',
    'joinDate',
    'session',
    'actions',
  ];

  ngOnInit() {
    this.loadUsers();

    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }

  loadUsers() {
    this.userService.getAll().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  openDialog(id: string | null = null) {
    this.showDialog = true;
    this.editId = id;

    if (id !== null) {
      const user = this.users.find(u => u.id === id);
      if (user) {
        this.firstNameControl.setValue(user.first_name);
        this.lastNameControl.setValue(user.last_name);
        this.usernameControl.setValue(user.username);
        this.emailControl.setValue(user.email);
      }
    } else {
      this.firstNameControl.reset('');
      this.lastNameControl.reset('');
      this.usernameControl.reset('');
      this.emailControl.reset('');
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.editId = null;
    this.firstNameControl.reset('');
    this.lastNameControl.reset('');
    this.usernameControl.reset('');
    this.emailControl.reset('');
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
    const user: Partial<User> = {
      first_name: this.firstNameControl.value ?? '',
      last_name: this.lastNameControl.value ?? '',
      username: this.usernameControl.value ?? '',
      email: this.emailControl.value ?? '',
    };

    if (
      !user.first_name ||
      !user.last_name ||
      !user.username ||
      !user.email
    )
      return;

    if (this.editId !== null) {
      this.userService.updateUser(this.editId, user).subscribe(() => {
        this.loadUsers();
        this.closeDialog();
      });
    } else {
      // Note: Adding new users would require a separate API endpoint
      // For now, we'll just close the dialog
      this.closeDialog();
    }
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  applyFilters() {
    const search = (this.searchControl.value || '').toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.first_name.toLowerCase().includes(search) ||
        u.last_name.toLowerCase().includes(search) ||
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
