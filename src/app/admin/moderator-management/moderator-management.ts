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
import { ModeratorService, Moderator } from '../../services/moderator';

type SortField = 'first_name' | 'email';
type SortDirection = 'asc' | 'desc';

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
export class ModeratorManagement implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private moderatorService = inject(ModeratorService);

  moderators: Moderator[] = [];
  filteredModerators: Moderator[] = [];
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
    this.loadModerators();

    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }

  loadModerators() {
    this.moderatorService.getAll().subscribe(moderators => {
      this.moderators = moderators;
      this.applyFilters();
    });
  }

  openDialog(id: string | null = null) {
    this.showDialog = true;
    this.editId = id;

    if (id !== null) {
      const mod = this.moderators.find(m => m.id === id);
      if (mod) {
        this.firstNameControl.setValue(mod.first_name);
        this.lastNameControl.setValue(mod.last_name);
        this.usernameControl.setValue(mod.username);
        this.emailControl.setValue(mod.email);
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

  saveModerator() {
    const moderatorData = {
      first_name: this.firstNameControl.value ?? '',
      last_name: this.lastNameControl.value ?? '',
      username: this.usernameControl.value ?? '',
      email: this.emailControl.value ?? '',
      password: this.passwordControl.value ?? '',
    };

    if (!moderatorData.first_name || !moderatorData.last_name || !moderatorData.username || !moderatorData.email || !moderatorData.password) return;

    if (this.editId !== null) {
      this.moderatorService.updateModerator(this.editId, moderatorData).subscribe(() => {
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
    this.moderatorService.deleteModerator(id).subscribe(() => {
      this.loadModerators();
    });
  }

  applyFilters() {
    const search = (this.searchControl.value || '').toLowerCase();
    this.filteredModerators = this.moderators.filter(
      (mod) =>
        mod.first_name.toLowerCase().includes(search) ||
        mod.last_name.toLowerCase().includes(search) ||
        mod.username.toLowerCase().includes(search) ||
        mod.email.toLowerCase().includes(search)
    );

    this.filteredModerators.sort((a, b) => {
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
