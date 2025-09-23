import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  dob?: string;
  bio?: string;
  photo_url?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:4000/api';
  private usersSignal = signal<User[]>([]);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap(users => {
        const filtered = users.filter(u => u.role === 'voter' || u.role === 'user');
        this.usersSignal.set(filtered);
      })
    );
  }

  getUsersSignal() {
    return this.usersSignal.asReadonly();
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user).pipe(
      tap(updated => {
        const users = [...this.usersSignal()];
        const index = users.findIndex(u => u.id === id);
        if (index > -1) {
          users[index] = updated;
          this.usersSignal.set(users);
        }
      })
    );
  }

  updateCurrentUser(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, user, { withCredentials: true }).pipe(
      tap(updated => {
        const users = [...this.usersSignal()];
        const index = users.findIndex(u => u.id === updated.id);
        if (index > -1) {
          users[index] = updated;
          this.usersSignal.set(users);
        }
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`, { withCredentials: true });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        const users = this.usersSignal().filter(u => u.id !== id);
        this.usersSignal.set(users);
      })
    );
  }

  updateCurrentUserState(user: User | null) {
    this.currentUserSubject.next(user);
  }

  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  // Synchronization methods
  syncWithAuthService(): void {
    const authUser = this.authService.getCurrentUser();
    if (authUser) {
      const normalizedUser = this.normalizeUserFromAuth(authUser);
      this.currentUserSubject.next(normalizedUser);
    }
  }

  updateUserInBothServices(userData: any): void {
    console.log('UserService.updateUserInBothServices called with:', userData);

    // Update AuthService (sessionStorage) - use local update for immediate sync
    this.authService.updateUserLocally(userData);

    // Update UserService BehaviorSubject
    const currentUser = this.getCurrentUserSync();
    console.log('Current user in UserService:', currentUser);

    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      console.log('Updated user to be set:', updatedUser);
      this.updateCurrentUserState(updatedUser);
    } else {
      console.log('No current user found in UserService');
    }
  }

  // User object normalization utilities
  private normalizeUserFromAuth(authUser: any): User {
    return {
      id: authUser.id,
      first_name: authUser.first_name || authUser.firstName || '',
      last_name: authUser.last_name || authUser.lastName || '',
      username: authUser.username,
      email: authUser.email,
      role: authUser.role,
      dob: authUser.dob,
      bio: authUser.bio,
      photo_url: authUser.photo_url || authUser.photo,
      created_at: authUser.created_at || new Date().toISOString()
    };
  }

  normalizeUserForFrontend(user: User): any {
    return {
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      photo: user.photo_url || '/assets/admin.png'
    };
  }
}
