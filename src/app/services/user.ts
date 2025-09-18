import { Injectable, signal } from '@angular/core';

export interface User {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSignal = signal<User[]>(this.load());

  private load(): User[] {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(data: User[]) {
    localStorage.setItem('users', JSON.stringify(data));
  }

  getAll(): User[] {
    return this.usersSignal();
  }

  add(user: User) {
    const users = [...this.usersSignal(), user];
    this.usersSignal.set(users);
    this.saveToStorage(users);
  }

  update(index: number, user: User) {
    const users = [...this.usersSignal()];
    users[index] = user;
    this.usersSignal.set(users);
    this.saveToStorage(users);
  }

  delete(index: number) {
    const users = [...this.usersSignal()];
    users.splice(index, 1);
    this.usersSignal.set(users);
    this.saveToStorage(users);
  }
}
