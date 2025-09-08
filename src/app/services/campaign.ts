import { Injectable, signal } from '@angular/core';

export interface Candidate {
  name: string;
  bio: string;
  photo: string;
  properties: string[];
  votes?: number;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  logo: string | null;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private storageKey = 'campaigns';

  private _campaigns = signal<Campaign[]>([]);
  campaigns = this._campaigns.asReadonly();

  private nextId = 1;

  constructor() {
    this.loadCampaigns();
  }

  private saveCampaigns() {
    localStorage.setItem(this.storageKey, JSON.stringify(this._campaigns()));
  }

  private loadCampaigns() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const parsed: Campaign[] = JSON.parse(stored);
      this._campaigns.set(parsed);
      // update nextId so it doesn’t reuse IDs
      this.nextId = parsed.length > 0 ? Math.max(...parsed.map(c => c.id)) + 1 : 1;
    }
  }

  addCampaign(campaign: Omit<Campaign, 'id'>) {
    const newCampaign: Campaign = { ...campaign, id: this.nextId++ };
    newCampaign.candidates = newCampaign.candidates.map(c => ({
      ...c,
      votes: c.votes ?? 0
    }));
    this._campaigns.update(list => [...list, newCampaign]);
    this.saveCampaigns();
  }

  updateCampaign(id: number, updated: Partial<Campaign>) {
    this._campaigns.update(list =>
      list.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
    this.saveCampaigns();
  }

  deleteCampaign(id: number) {
    this._campaigns.update(list => list.filter(c => c.id !== id));
    this.saveCampaigns();
  }

  getCampaignById(id: number) {
    return this._campaigns().find(c => c.id === id);
  }

  clearCampaigns() {
    this._campaigns.set([]);
    this.saveCampaigns();
  }

  vote(campaignId: number, candidateIndex: number) {
    this._campaigns.update(list =>
      list.map(c => {
        if (c.id === campaignId) {
          return {
            ...c,
            candidates: c.candidates.map((cand, idx) =>
              idx === candidateIndex
                ? { ...cand, votes: (cand.votes ?? 0) + 1 }
                : cand
            )
          };
        }
        return c;
      })
    );
    this.saveCampaigns();
  }
}
