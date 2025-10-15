import { Component, signal, computed, HostListener, inject } from '@angular/core';
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
import { ModeratorService, Moderator } from '../../services/moderator';

type SortField = 'first_name' | 'email';
type SortDirection = 'asc' | 'desc';

type ModeratorForm = {
  first_name: FormControl<string>;
  last_name: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-moderator-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FuiInput,
    Button,
    BurgerMenu,
    CdkTableModule,
  ],
  templateUrl: './moderator-management.html',
  styleUrls: ['./moderator-management.scss'],
})
export class ModeratorManagement {
  private fb = inject(NonNullableFormBuilder);
  private moderatorService = inject(ModeratorService);

  moderators = signal<Moderator[]>([]);
  showDialog = signal(false);
  editId = signal<string | null>(null);
  sortField = signal<SortField>('first_name');
  sortDirection = signal<SortDirection>('asc');

  form = signal<FormGroup<ModeratorForm>>(
    this.fb.group<ModeratorForm>({
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

  filteredModerators = computed(() => {
    const search = this.searchValue()?.toLowerCase() || '';
    let filtered = this.moderators().filter(
      (mod) =>
        mod.first_name.toLowerCase().includes(search) ||
        mod.last_name.toLowerCase().includes(search) ||
        mod.username.toLowerCase().includes(search) ||
        mod.email.toLowerCase().includes(search)
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
    this.loadModerators();
  }

  loadModerators() {
    this.moderatorService.getAll().subscribe(moderators => {
      this.moderators.set(moderators);
    });
  }

  openDialog(id: string | null = null) {
    this.showDialog.set(true);
    this.editId.set(id);

    if (id !== null) {
      const mod = this.moderators().find(m => m.id === id);
      if (mod) {
        this.form().setValue({
          first_name: mod.first_name,
          last_name: mod.last_name,
          username: mod.username,
          email: mod.email,
          password: '', // Don't populate password when editing
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

  saveModerator() {
    if (this.form().invalid) return;

    const moderatorData = this.form().getRawValue();

    if (this.editId() !== null) {
      this.moderatorService.updateModerator(this.editId()!, moderatorData).subscribe(() => {
        this.loadModerators();
        this.closeDialog();
      });
    } else {
      this.moderatorService.createModerator(moderatorData).subscribe(() => {
        this.loadModerators();
        this.closeDialog();
      });
    }
  }

  deleteModerator(id: string) {
    const confirmDelete = window.confirm('Are you sure you want to delete this moderator?');
    if (confirmDelete) {
      this.moderatorService.deleteModerator(id).subscribe(() => {
        this.loadModerators();
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
}
