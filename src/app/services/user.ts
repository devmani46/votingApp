import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

  constructor(private http: HttpClient) {}

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

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        const users = this.usersSignal().filter(u => u.id !== id);
        this.usersSignal.set(users);
      })
    );
  }
}
