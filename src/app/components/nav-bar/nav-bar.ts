import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.scss'],
})
export class NavBar implements OnInit, OnDestroy {
  user: any = {};
  dropdownOpen = false;

  constructor(private auth: AuthService) {}

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
    this.user =
      this.auth.getCurrentUser() || {
        username: 'Guest',
        photo: '/assets/admin.png',
      };
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }

  logout() {
    this.auth.logout();
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
