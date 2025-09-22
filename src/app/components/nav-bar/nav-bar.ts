import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { Subscription } from 'rxjs';

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
  menuOpen = false;
  private userSubscription?: Subscription;

  private auth = inject(AuthService);
  private userService = inject(UserService);

  ngOnInit() {
    this.loadUser();
    window.addEventListener('storage', this.syncUser);
    window.addEventListener('userProfileUpdated', this.handleUserProfileUpdate);

    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.updateUserDisplay(user);
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.syncUser);
    window.removeEventListener('userProfileUpdated', this.handleUserProfileUpdate);
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private syncUser = (event: StorageEvent) => {
    if (event.key === 'currentUser') {
      this.loadUser();
    }
  };

  private loadUser() {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.user = {
        ...currentUser,
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        photo: currentUser.photo_url || '/assets/admin.png'
      };
    } else {
      this.user = {
        username: 'Guest',
        photo: '/assets/admin.png',
      };
    }
  }

  private updateUserDisplay(user: any) {
    this.user = {
      ...user,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      photo: user.photo_url || '/assets/admin.png'
    };
  }

  private handleUserProfileUpdate = (event: Event) => {
    this.loadUser();
  };

  refreshUser() {
    this.loadUser();
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
