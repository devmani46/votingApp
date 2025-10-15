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
  NonNullableFormBuilder,
  Validators,
  FormGroup,
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

type UserForm = {
  first_name: FormControl<string>;
  last_name: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

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
  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  users = signal<User[]>([]);
  showDialog = signal(false);
  editId = signal<string | null>(null);
  sortField = signal<SortField>('first_name');
  sortDirection = signal<SortDirection>('asc');

  form = signal<FormGroup<UserForm>>(
    this.fb.group<UserForm>({
      first_name: this.fb.control('', { validators: [Validators.required] }),
      last_name: this.fb.control('', { validators: [Validators.required] }),
      username: this.fb.control('', { validators: [Validators.required] }),
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      password: this.fb.control('', { validators: [Validators.required] }),
    })
  );

  firstNameControl = computed(() => this.form().controls.first_name);
  lastNameControl = computed(() => this.form().controls.last_name);
  usernameControl = computed(() => this.form().controls.username);
  emailControl = computed(() => this.form().controls.email);
  passwordControl = computed(() => this.form().controls.password);

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
        this.form().setValue({
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email,
          password: '',
        });
      }
    } else {
      this.form().reset();
    }
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editId.set(null);
    this.form().reset();
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
    if (this.form().invalid) return;

    const user = this.form().getRawValue();

    if (this.editId() !== null) {
      this.userService.updateUser(this.editId()!, user).subscribe(() => {
        this.loadUsers();
        this.closeDialog();
      });
    } else {
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
