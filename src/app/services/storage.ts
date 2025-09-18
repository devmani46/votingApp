import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private roleSignal = signal<string | null>(localStorage.getItem('role'));

  setRole(role: string | null) {
    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
    this.roleSignal.set(role);
  }

  getRole(): string | null {
    return this.roleSignal();
  }

  clear() {
    localStorage.clear();
    this.roleSignal.set(null);
  }
}
