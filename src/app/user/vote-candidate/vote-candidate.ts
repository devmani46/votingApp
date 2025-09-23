import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CampaignService, Campaign } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { StorageService } from '../../services/storage';
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
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  campaign?: Campaign;
  showPopup = false;
  private votedCampaigns: Record<string, string[]> = {};
  private currentUserEmail: string = '';
  candidatePopupOpen = false;
  activeIndex: number | null = null;
  activeCandidate: any = null;
  totalVotes = 0;
  votePercent = 0;
  isLoading = true;
  campaignNotFound = false;

  constructor() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || '';
  }

  ngOnInit() {
    document.addEventListener('keydown', this.keyHandler);
    this.loadCampaign();
  }

  private async loadCampaign() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading = false;
      this.campaignNotFound = true;
      return;
    }

    // Wait for campaigns to load from the API
    // Use effect to watch for changes in campaigns signal
    const campaigns = this.campaignService.campaigns;
    if (campaigns.length > 0) {
      // Campaigns have loaded, now find the specific campaign
      this.campaign = this.campaignService.getCampaignById(id) ?? undefined;
      this.isLoading = false;

      if (!this.campaign) {
        this.campaignNotFound = true;
      } else {
        this.campaignNotFound = false;
        this.refreshTotalVotes();
        this.loadVotedCampaigns();
        this.checkIfAlreadyVoted();
      }
    } else {
      // If no campaigns loaded yet, wait a bit and try again
      setTimeout(() => {
        this.campaign = this.campaignService.getCampaignById(id) ?? undefined;
        this.isLoading = false;

        if (!this.campaign) {
          this.campaignNotFound = true;
        } else {
          this.campaignNotFound = false;
          this.refreshTotalVotes();
          this.loadVotedCampaigns();
          this.checkIfAlreadyVoted();
        }
      }, 1000);
    }
  }

  private loadVotedCampaigns() {
    this.votedCampaigns = this.storageService.getVotedCampaigns();
  }

  private checkIfAlreadyVoted() {
    if (this.campaign?.id && this.currentUserEmail && this.storageService.hasVotedForCampaign(this.currentUserEmail, this.campaign.id)) {
      this.showPopup = true;
    }
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
      // Add vote to persistent storage
      this.storageService.addVotedCampaign(this.currentUserEmail, this.campaign!.id);

      // Update local voted campaigns for immediate UI feedback
      if (!this.votedCampaigns[this.currentUserEmail]) {
        this.votedCampaigns[this.currentUserEmail] = [];
      }
      this.votedCampaigns[this.currentUserEmail].push(this.campaign!.id);

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

  goBack() {
    this.router.navigate(['/user-campaign']);
  }
}
