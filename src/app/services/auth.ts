import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    username: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api';
  private userKey = 'currentUser';
  private roleKey = 'role';

  constructor(private router: Router, private http: HttpClient) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap(response => {
        // Store user data in sessionStorage (cleared on browser close)
        sessionStorage.setItem(this.userKey, JSON.stringify(response.user));
        sessionStorage.setItem(this.roleKey, response.user.role);

        // Navigate based on role
        if (response.user.role === 'admin' || response.user.role === 'moderator') {
          this.router.navigate(['/menu']);
        } else {
          this.router.navigate(['/user-page']);
        }
      }),
      map(() => true)
    );
  }

  register(newUser: any): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/auth/signup`, newUser, { withCredentials: true }).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      }),
      map(() => true)
    );
  }

  logout(): void {
    // Clear session storage
    sessionStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.roleKey);

    // Call logout endpoint to clear cookies
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout endpoint fails, navigate to login
        this.router.navigate(['/login']);
      }
    });
  }

  getCurrentUser(): any {
    const stored = sessionStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  getRole(): string | null {
    const role = sessionStorage.getItem(this.roleKey);
    return role;
  }

  getToken(): string | null {
    // Token is now handled by HttpOnly cookies, not accessible from JavaScript
    return null;
  }

  updateUser(updatedUser: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/me`, updatedUser, { withCredentials: true });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, { withCredentials: true });
  }
}


