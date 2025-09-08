import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.scss']
})
export class NavBar implements OnInit, OnDestroy {
  user: any = {};
  dropdownOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUser();

    window.addEventListener('storage', this.syncUser);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.syncUser);
  }

  private syncUser = (event: StorageEvent) => {
    if (event.key === 'currentUser') {
      this.loadUser();
    }
  };

  private loadUser() {
    const stored = localStorage.getItem('currentUser');
    this.user = stored
      ? JSON.parse(stored)
      : { username: 'Guest', photo: '/assets/admin.png' };
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
    this.loadUser();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
}
