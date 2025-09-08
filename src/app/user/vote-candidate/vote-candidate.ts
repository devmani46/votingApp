import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CampaignService, Campaign } from '../../services/campaign';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { Button } from '../../components/button/button';

@Component({
  selector: 'app-vote-candidate',
  standalone: true,
  imports: [CommonModule, NavBar, Footer, CampaignCard, Button],
  templateUrl: './vote-candidate.html',
  styleUrls: ['./vote-candidate.scss'],
})
export class VoteCandidate {
  private route = inject(ActivatedRoute);
  private campaignService = inject(CampaignService);

  campaign: Campaign | undefined;
  showPopup = false;

  private votedCampaigns = new Set<number>();

  constructor() {
    this.loadVotes();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.campaign = this.campaignService.getCampaignById(id);
  }

  vote(candidateIndex: number) {
    if (!this.campaign) return;

    if (this.hasVoted(this.campaign.id)) {
      this.showPopup = true;
      return;
    }

    this.campaignService.vote(this.campaign.id, candidateIndex);

    this.votedCampaigns.add(this.campaign.id);
    localStorage.setItem('votedCampaigns', JSON.stringify([...this.votedCampaigns]));

    this.campaign = this.campaignService.getCampaignById(this.campaign.id);
  }

  hasVoted(campaignId: number): boolean {
    return this.votedCampaigns.has(campaignId);
  }

  private loadVotes() {
    const stored = localStorage.getItem('votedCampaigns');
    if (stored) this.votedCampaigns = new Set(JSON.parse(stored));
  }

  closePopup() {
    this.showPopup = false;
  }
}
