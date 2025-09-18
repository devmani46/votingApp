import { Injectable, signal } from '@angular/core';

export interface Moderator {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModeratorService {
  private moderatorsSignal = signal<Moderator[]>(this.load());

  private load(): Moderator[] {
    const data = localStorage.getItem('moderators');
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(data: Moderator[]) {
    localStorage.setItem('moderators', JSON.stringify(data));
  }

  getAll(): Moderator[] {
    return this.moderatorsSignal();
  }

  add(moderator: Moderator) {
    const mods = [...this.moderatorsSignal(), moderator];
    this.moderatorsSignal.set(mods);
    this.saveToStorage(mods);
  }

  update(index: number, moderator: Moderator) {
    const mods = [...this.moderatorsSignal()];
    mods[index] = moderator;
    this.moderatorsSignal.set(mods);
    this.saveToStorage(mods);
  }

  delete(index: number) {
    const mods = [...this.moderatorsSignal()];
    mods.splice(index, 1);
    this.moderatorsSignal.set(mods);
    this.saveToStorage(mods);
  }
}
