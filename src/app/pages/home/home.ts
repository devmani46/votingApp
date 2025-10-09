import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'moderator') {
        this.router.navigate(['/menu']);
      } else {
        this.router.navigate(['/user-page']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
