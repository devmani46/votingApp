import {
  Component,
  signal,
  computed,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FuiInput } from '../../components/fui-input/fui-input';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { CdkTableModule } from '@angular/cdk/table';
import { UserService, User } from '../../services/user';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

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
    MatPaginatorModule,
  ],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'],
})
export class UserManagement {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  users = signal<User[]>([]);
  showDialog = signal(false);
  editId = signal<string | null>(null);
  sortField = signal<SortField>('first_name');
  sortDirection = signal<SortDirection>('asc');

  firstNameControl = new FormControl('', Validators.required);
  lastNameControl = new FormControl('', Validators.required);
  usernameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', Validators.required);

  searchControl = new FormControl('');
  searchValue = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  displayedColumns: string[] = [
    'username',
    'email',
    'joinDate',
    // 'session',
    'actions',
  ];

  filteredUsers = computed(() => {
    const search = this.searchValue()?.toLowerCase() || '';
    let filtered = this.users().filter(
      (u) =>
        u.first_name.toLowerCase().includes(search) ||
        u.last_name.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );

    filtered.sort((a, b) => {
      const valA = a[this.sortField()].toLowerCase();
      const valB = b[this.sortField()].toLowerCase();

      if (valA < valB) return this.sortDirection() === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe((users) => {
      this.users.set(users);
    });
  }

  openDialog(id: string | null = null) {
    this.showDialog.set(true);
    this.editId.set(id);

    if (id !== null) {
      const user = this.users().find((u) => u.id === id);
      if (user) {
        this.firstNameControl.setValue(user.first_name);
        this.lastNameControl.setValue(user.last_name);
        this.usernameControl.setValue(user.username);
        this.emailControl.setValue(user.email);
        this.passwordControl.reset(''); // Don't populate password when editing
      }
    } else {
      this.firstNameControl.reset('');
      this.lastNameControl.reset('');
      this.usernameControl.reset('');
      this.emailControl.reset('');
      this.passwordControl.reset('');
    }
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editId.set(null);
    this.firstNameControl.reset('');
    this.lastNameControl.reset('');
    this.usernameControl.reset('');
    this.emailControl.reset('');
    this.passwordControl.reset('');
  }

  @HostListener('document:keydown', ['$event'])
  handleEsc(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showDialog()) {
      this.closeDialog();
    }
  }

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
      password: this.passwordControl.value ?? '',
    };

    if (
      !user.first_name ||
      !user.last_name ||
      !user.username ||
      !user.email ||
      !user.password
    )
      return;

    if (this.editId() !== null) {
      this.userService.updateUser(this.editId()!, user).subscribe(() => {
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
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    );
    if (confirmDelete) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  changeSort(field: SortField) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  pageSize = 10;
  currentPage = 0;

  pagedUsers() {
    const all = this.filteredUsers();
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return all.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }
}
