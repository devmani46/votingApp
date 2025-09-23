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
  private authSubscription?: Subscription;

  private auth = inject(AuthService);
  private userService = inject(UserService);

  ngOnInit() {
    this.loadUser();
    window.addEventListener('storage', this.syncUser);
    window.addEventListener('userProfileUpdated', this.handleUserProfileUpdate);

    // Subscribe to UserService for reactive updates
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      console.log('NavBar received user update:', user);
      if (user) {
        this.updateUserDisplay(user);
      }
    });

    // Subscribe to AuthService for sessionStorage updates
    this.authSubscription = this.auth.userUpdate$.subscribe(user => {
      if (user) {
        this.userService.syncWithAuthService();
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.syncUser);
    window.removeEventListener('userProfileUpdated', this.handleUserProfileUpdate);
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private syncUser = (event: StorageEvent) => {
    if (event.key === 'currentUser') {
      this.userService.syncWithAuthService();
    }
  };

  private loadUser() {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.userService.syncWithAuthService();
    } else {
      this.user = {
        username: 'Guest',
        photo: '/assets/admin.png',
      };
    }
  }

  private updateUserDisplay(user: any) {
    const normalizedUser = this.userService.normalizeUserForFrontend(user);
    this.user = {
      ...this.user, // Keep existing properties
      ...normalizedUser,
      firstName: normalizedUser.firstName || '',
      lastName: normalizedUser.lastName || '',
      photo: normalizedUser.photo || '/assets/admin.png',
      username: normalizedUser.username || 'Guest',
      // Ensure template can access properties
      photo_url: normalizedUser.photo,
      first_name: normalizedUser.firstName,
      last_name: normalizedUser.lastName
    };
  }

  private handleUserProfileUpdate = (event: Event) => {
    console.log('NavBar received userProfileUpdated event:', event);
    // Custom event handler now syncs with UserService instead of reloading from AuthService
    this.userService.syncWithAuthService();
  };

  refreshUser() {
    this.userService.syncWithAuthService();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }

  logout() {
    this.auth.logout();
    this.userService.updateCurrentUserState(null);
    this.user = {
      username: 'Guest',
      photo: '/assets/admin.png',
    };
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
}
