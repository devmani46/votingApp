import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Moderator {
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
export class ModeratorService {
  private apiUrl = 'http://localhost:4000/api';
  private moderatorsSignal = signal<Moderator[]>([]);

  constructor(private http: HttpClient) {}

  getAll(): Observable<Moderator[]> {
    return this.http.get<Moderator[]>(`${this.apiUrl}/users?role=moderator`, { withCredentials: true }).pipe(
      tap(moderators => {
        this.moderatorsSignal.set(moderators);
      })
    );
  }

  getModeratorsSignal() {
    return this.moderatorsSignal.asReadonly();
  }

  updateModerator(id: string, moderator: Partial<Moderator>): Observable<Moderator> {
    return this.http.put<Moderator>(`${this.apiUrl}/users/${id}`, moderator, { withCredentials: true }).pipe(
      tap(updated => {
        const mods = [...this.moderatorsSignal()];
        const index = mods.findIndex(m => m.id === id);
        if (index > -1) {
          mods[index] = updated;
          this.moderatorsSignal.set(mods);
        }
      })
    );
  }

  deleteModerator(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        const mods = this.moderatorsSignal().filter(m => m.id !== id);
        this.moderatorsSignal.set(mods);
      })
    );
  }

  createModerator(moderator: { first_name: string; last_name: string; username: string; email: string; password: string }): Observable<Moderator> {
    return this.http.post<Moderator>(`${this.apiUrl}/users`, { ...moderator, role: 'moderator' }, { withCredentials: true }).pipe(
      tap(newMod => {
        const mods = [...this.moderatorsSignal(), newMod];
        this.moderatorsSignal.set(mods);
      })
    );
  }
}
