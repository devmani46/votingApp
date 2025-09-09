import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class VoteCandidate implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private campaignService = inject(CampaignService);

  campaign?: Campaign;
  showPopup = false;
  private votedCampaigns = new Set<number>();

  candidatePopupOpen = false;
  activeIndex: number | null = null;
  activeCandidate: any = null;
  totalVotes = 0;
  votePercent = 0;

  constructor() {
    this.loadVotes();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.campaign = this.campaignService.getCampaignById(id) ?? undefined;
  }

  ngOnInit() {
    document.addEventListener('keydown', this.keyHandler);
    this.refreshTotalVotes();
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }

  vote(candidateIndex: number) {
    if (!this.campaign?.id) return;

    if (this.hasVoted(this.campaign.id)) {
      this.showPopup = true;
      return;
    }

    this.campaignService.vote(this.campaign.id, candidateIndex);
    this.votedCampaigns.add(this.campaign.id);
    localStorage.setItem('votedCampaigns', JSON.stringify([...this.votedCampaigns]));

    this.campaign = this.campaignService.getCampaignById(this.campaign.id) ?? undefined;
    this.refreshTotalVotes();

    if (this.candidatePopupOpen && this.activeIndex === candidateIndex) {
      this.setActiveCandidate(candidateIndex);
    }
  }

  hasVoted(campaignId?: number): boolean {
    if (!campaignId) return false;
    return this.votedCampaigns.has(campaignId);
  }

  private loadVotes() {
    const stored = localStorage.getItem('votedCampaigns');
    if (stored) this.votedCampaigns = new Set(JSON.parse(stored));
  }

  closePopup() {
    this.showPopup = false;
  }

  openCandidatePopup(index: number) {
    if (!this.campaign) return;

    this.activeIndex = index;
    this.candidatePopupOpen = true;

    const candidate = this.campaign.candidates?.[index];
    if (candidate) {
      this.setActiveCandidate(index);
    } else {
      const stored = localStorage.getItem('campaigns');
      if (stored) {
        try {
          const arr = JSON.parse(stored);
          const found = arr.find((c: any) => c.id === this.campaign?.id);
          if (found?.candidates?.[index]) {
            this.activeCandidate = found.candidates[index];
          } else {
            this.activeCandidate = null;
          }
        } catch {
          this.activeCandidate = null;
        }
      }
    }
  }

  setActiveCandidate(index: number) {
    if (!this.campaign) return;
    const c = this.campaign.candidates[index];
    this.activeCandidate = {
      name: c.name,
      bio: c.bio,
      photo: c.photo,
      votes: c.votes ?? 0,
      properties: Array.isArray(c.properties) ? [...c.properties] : [],
    };
    this.activeIndex = index;
    this.refreshTotalVotes();
    this.updateVotePercent();
  }

  closeCandidatePopup() {
    this.candidatePopupOpen = false;
    this.activeCandidate = null;
    this.activeIndex = null;
    this.votePercent = 0;
  }

  keyHandler = (event: KeyboardEvent) => {
    if (!this.candidatePopupOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeCandidatePopup();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.navigateActive(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.navigateActive(1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.activeIndex !== null && this.campaign?.id && !this.hasVoted(this.campaign.id)) {
        this.vote(this.activeIndex);
      }
      return;
    }
  };

  navigateActive(offset: number) {
    if (!this.campaign || this.activeIndex === null) return;
    const len = this.campaign.candidates?.length ?? 0;
    if (len === 0) return;
    let next = (this.activeIndex + offset + len) % len;
    this.openCandidatePopup(next);
  }

  refreshTotalVotes() {
    if (!this.campaign) {
      this.totalVotes = 0;
      return;
    }
    this.totalVotes = (this.campaign.candidates ?? []).reduce((s, c) => s + (c.votes ?? 0), 0);
  }

  updateVotePercent() {
    const votes = this.activeCandidate?.votes ?? 0;
    if (this.totalVotes === 0) {
      this.votePercent = votes > 0 ? 100 : 0;
    } else {
      this.votePercent = Math.round((votes / Math.max(1, this.totalVotes)) * 100);
    }
  }
}
