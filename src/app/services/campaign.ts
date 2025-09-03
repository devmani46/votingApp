import { Injectable, signal } from '@angular/core';

export interface Campaign {
  title: string;
  description: string;
  logo: string | null;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private _campaigns = signal<Campaign[]>([]);
  campaigns = this._campaigns.asReadonly();

  addCampaign(campaign: Campaign) {
    console.log('Added campaign:', campaign);
    this._campaigns.update(list => [...list, campaign]);
  }

  clearCampaigns() {
    this._campaigns.set([]);
  }
}
