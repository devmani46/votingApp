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
import { NgModule } from '@angular/core';

type SortField = 'name' | 'email';
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

  moderators: any[] = [];
  filteredModerators: any[] = [];
  showDialog = false;
  editIndex: number | null = null;

  nameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', Validators.required);

  searchControl = new FormControl('');
  sortField: SortField = 'name';
  sortDirection: SortDirection = 'asc';

  displayedColumns: string[] = [
    'username',
    'email',
    'joinDate',
    'session',
    'actions',
  ];

  ngOnInit() {
    const savedMods = localStorage.getItem('moderators');
    this.moderators = savedMods ? JSON.parse(savedMods) : [];
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
      password: this.passwordControl.value ?? '',
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
    this.applyFilters();
  }

  applyFilters() {
    const search = (this.searchControl.value || '').toLowerCase();
    this.filteredModerators = this.moderators.filter(
      (mod) =>
        mod.name.toLowerCase().includes(search) ||
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
