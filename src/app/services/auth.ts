import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private adminEmail = 'admin@gmail.com';
  private adminPassword = 'Admin@123';

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (email === this.adminEmail && password === this.adminPassword) {
      localStorage.setItem('role', 'admin');
      localStorage.removeItem('currentUser');
      this.router.navigate(['/menu']);
      return true;
    }

    const moderators = JSON.parse(localStorage.getItem('moderators') || '[]');
    const foundModerator = moderators.find(
      (m: any) => m.email === email && m.password === password
    );

    if (foundModerator) {
      localStorage.setItem('role', 'moderator');
      if (!foundModerator.photo && !foundModerator.image) {
        foundModerator.photo = 'assets/admin.png';
      }
      localStorage.setItem('currentUser', JSON.stringify(foundModerator));
      this.router.navigate(['/menu']);
      return true;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      localStorage.setItem('role', 'user');
      if (!foundUser.photo && !foundUser.image) {
        foundUser.photo = 'assets/admin.png';
      }
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      this.router.navigate(['/user-page']);
      return true;
    }

    return false;
  }

  register(newUser: any): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.some(
      (u: any) => u.email === newUser.email || u.username === newUser.username
    );
    if (exists) {
      return false;
    }

    if (!newUser.photo && !newUser.image) {
      newUser.photo = 'assets/admin.png';
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('role', 'user');

    this.router.navigate(['/user-page']);
    return true;
  }

  logout(): void {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  updateUser(updatedUser: any) {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex((u: any) => u.email === updatedUser.email);
    if (idx > -1) {
      users[idx] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  getVotedCampaigns(): Record<string, number[]> {
    const stored = localStorage.getItem('votedCampaigns');
    return stored ? JSON.parse(stored) : {};
  }

  saveVotedCampaigns(voted: Record<string, number[]>) {
    localStorage.setItem('votedCampaigns', JSON.stringify(voted));
  }
}


