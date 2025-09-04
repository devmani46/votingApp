import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.scss']
})
export class NavBar {
  user: any = {};
  dropdownOpen = false;

  constructor(private router: Router) {
    const stored = localStorage.getItem('userData');
    this.user = stored ? JSON.parse(stored) : { name: 'Guest', image: 'https://i.pravatar.cc/40' };
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goToProfile() {
    this.router.navigate(['/user-profile']);
    this.dropdownOpen = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
}
