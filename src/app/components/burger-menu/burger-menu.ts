import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './burger-menu.html',
  styleUrls: ['./burger-menu.scss']
})
export class BurgerMenu {
  isOpen = false;
  role: string | null = null;

  constructor(private router: Router) {
    this.role = localStorage.getItem('role');
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  logout() {
    localStorage.removeItem('role');
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
