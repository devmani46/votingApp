import { Component } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfile {
  user: any = {};

  constructor() {
    const stored = localStorage.getItem('userData');
    this.user = stored ? JSON.parse(stored) : { name: 'Guest', email: '', image: '' };
  }
}
