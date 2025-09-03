import { Injectable, signal } from '@angular/core';

export interface Candidate {
  name: string;
  bio: string;
  photo: string;
  properties: string[];
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
  private _campaigns = signal<Campaign[]>([]);
  campaigns = this._campaigns.asReadonly();

  private nextId = 1;

  addCampaign(campaign: Omit<Campaign, 'id'>) {
    const newCampaign: Campaign = { ...campaign, id: this.nextId++ };
    this._campaigns.update(list => [...list, newCampaign]);
  }

  updateCampaign(id: number, updated: Partial<Campaign>) {
    this._campaigns.update(list =>
      list.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
  }

  deleteCampaign(id: number) {
    this._campaigns.update(list => list.filter(c => c.id !== id));
  }

  getCampaignById(id: number) {
    return this._campaigns().find(c => c.id === id);
  }

  clearCampaigns() {
    this._campaigns.set([]);
  }
}
