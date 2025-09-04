import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { Button } from "../../components/button/button";

type SortField = 'name' | 'email';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BurgerMenu, Button],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagement implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  users: any[] = [];
  filteredUsers: any[] = [];

  searchControl = new FormControl('');
  sortField: SortField = 'name';
  sortDirection: SortDirection = 'asc';

  ngOnInit() {
    const savedUsers = localStorage.getItem('users');
    this.users = savedUsers ? JSON.parse(savedUsers) : [];
    this.applyFilters();

    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    document.addEventListener('keydown', this.handleEsc);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleEsc);
  }

  handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
    }
  };

  private save() {
    localStorage.setItem('users', JSON.stringify(this.users));
    this.applyFilters();
  }

  applyFilters() {
    const search = (this.searchControl.value || '').toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
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
