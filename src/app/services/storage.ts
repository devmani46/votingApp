import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private tokenKey = 'accessToken';
  private userKey = 'currentUser';
  private roleKey = 'role';
  private votedCampaignsKey = 'votedCampaigns';

  private tokenSignal = signal<string | null>(localStorage.getItem(this.tokenKey));
  private userSignal = signal<any | null>(this.parseUser(localStorage.getItem(this.userKey)));
  private roleSignal = signal<string | null>(localStorage.getItem(this.roleKey));
  private votedCampaignsSignal = signal<Record<string, string[]>>(this.parseVotedCampaigns(localStorage.getItem(this.votedCampaignsKey)));

  private parseUser(userStr: string | null): any | null {
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
    this.tokenSignal.set(token);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  setUser(user: any | null) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
    this.userSignal.set(user);
  }

  getUser(): any | null {
    return this.userSignal();
  }

  setRole(role: string | null) {
    if (role) {
      localStorage.setItem(this.roleKey, role);
    } else {
      localStorage.removeItem(this.roleKey);
    }
    this.roleSignal.set(role);
  }

  getRole(): string | null {
    return this.roleSignal();
  }

  clear() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.roleSignal.set(null);
  }

  private parseVotedCampaigns(votedCampaignsStr: string | null): Record<string, string[]> {
    if (!votedCampaignsStr) return {};
    try {
      return JSON.parse(votedCampaignsStr);
    } catch {
      return {};
    }
  }

  getVotedCampaigns(): Record<string, string[]> {
    return this.votedCampaignsSignal();
  }

  addVotedCampaign(userEmail: string, campaignId: string) {
    const votedCampaigns = this.getVotedCampaigns();
    if (!votedCampaigns[userEmail]) {
      votedCampaigns[userEmail] = [];
    }
    if (!votedCampaigns[userEmail].includes(campaignId)) {
      votedCampaigns[userEmail].push(campaignId);
      localStorage.setItem(this.votedCampaignsKey, JSON.stringify(votedCampaigns));
      this.votedCampaignsSignal.set(votedCampaigns);
    }
  }

  hasVotedForCampaign(userEmail: string, campaignId: string): boolean {
    const votedCampaigns = this.getVotedCampaigns();
    return votedCampaigns[userEmail]?.includes(campaignId) ?? false;
  }

  removeVotedCampaign(userEmail: string, campaignId: string) {
    const votedCampaigns = this.getVotedCampaigns();
    if (votedCampaigns[userEmail]) {
      votedCampaigns[userEmail] = votedCampaigns[userEmail].filter(id => id !== campaignId);
      localStorage.setItem(this.votedCampaignsKey, JSON.stringify(votedCampaigns));
      this.votedCampaignsSignal.set(votedCampaigns);
    }
  }
}
