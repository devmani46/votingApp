import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

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

  constructor(private auth: AuthService) {
    this.role = this.auth.getRole();
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
}
