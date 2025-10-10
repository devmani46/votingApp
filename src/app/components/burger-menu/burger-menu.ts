import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './burger-menu.html',
  styleUrls: ['./burger-menu.scss'],
})
export class BurgerMenu {
  isOpen = true;
  role: string | null = null;
  unreadCount = 0;
  private unreadSubscription?: Subscription;

  constructor(private auth: AuthService, private socketService: SocketService) {
    this.role = this.auth.getRole();
    this.unreadSubscription = this.socketService
      .getUnreadCount()
      .subscribe((count) => (this.unreadCount = count));
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
  }

  ngOnDestroy() {
    if (this.unreadSubscription) this.unreadSubscription.unsubscribe();
  }
}
