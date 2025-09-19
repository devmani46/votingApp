import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CampaignService, Campaign } from '../../services/campaign';
import { AuthService } from '../../services/auth';
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
  private authService = inject(AuthService);

  campaign?: Campaign;
  showPopup = false;
  private votedCampaigns: Record<string, string[]> = {};
  private currentUserEmail: string = '';
  candidatePopupOpen = false;
  activeIndex: number | null = null;
  activeCandidate: any = null;
  totalVotes = 0;
  votePercent = 0;

  constructor() {
    // Removed getVotedCampaigns call
    const currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || '';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.campaign = this.campaignService.getCampaignById(id) ?? undefined;
    }
  }

  ngOnInit() {
    document.addEventListener('keydown', this.keyHandler);
    this.refreshTotalVotes();
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }

  vote(candidateIndex: number) {
    if (!this.campaign?.id || !this.currentUserEmail) return;
    if (this.hasVoted(this.campaign.id)) {
      this.showPopup = true;
      return;
    }
    this.campaignService.castVote(this.campaign.id, this.campaign.candidates[candidateIndex].id).subscribe(() => {
      if (!this.votedCampaigns[this.currentUserEmail]) {
        this.votedCampaigns[this.currentUserEmail] = [];
      }
      this.votedCampaigns[this.currentUserEmail].push(this.campaign!.id);
      // Removed saveVotedCampaigns call
      this.campaign = this.campaignService.getCampaignById(this.campaign!.id) ?? undefined;
      this.refreshTotalVotes();
      if (this.candidatePopupOpen && this.activeIndex === candidateIndex) {
        this.setActiveCandidate(candidateIndex);
      }
    });
  }

  hasVoted(campaignId?: string): boolean {
    if (!campaignId || !this.currentUserEmail) return false;
    return this.votedCampaigns[this.currentUserEmail]?.includes(campaignId) ?? false;
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
    }
  }

  setActiveCandidate(index: number) {
    if (!this.campaign) return;
    const c = this.campaign.candidates[index];
    this.activeCandidate = {
      name: c.name,
      bio: c.bio,
      photo: c.photo_url,
      votes: c.votes ?? 0,
      properties: [], // Candidates don't have properties in the interface
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
