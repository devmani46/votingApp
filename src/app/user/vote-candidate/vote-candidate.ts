import { Component, inject, OnDestroy, OnInit, HostListener, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CampaignService, Campaign } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { StorageService } from '../../services/storage';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { Button } from '../../components/button/button';
import { SocketService } from '../../services/socket.service';

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
  private socketService = inject(SocketService);

  campaignId = signal<string>('');
  campaign = computed(() => this.campaignService.getCampaignById(this.campaignId()));
  showPopup = false;
  private votedCampaigns: Record<string, string[]> = {};
  private currentUserEmail: string = '';
  candidatePopupOpen = false;
  activeIndex = signal<number | null>(null);
  activeCandidate = computed(() => {
    const index = this.activeIndex();
    const c = this.campaign();
    if (index === null || !c || !c.candidates || index >= c.candidates.length) return null;
    const cand = c.candidates[index];
    return {
      name: cand.name,
      bio: cand.bio,
      photo: cand.photo_url,
      votes: cand.votes ?? 0,
    };
  });
  totalVotes = computed(() => {
    const c = this.campaign();
    if (!c) return 0;
    return (c.candidates ?? []).reduce((s, cand) => s + (cand.votes ?? 0), 0);
  });
  votePercent = computed(() => {
    const ac = this.activeCandidate();
    const tv = this.totalVotes();
    const votes = ac?.votes ?? 0;
    if (tv === 0) {
      return votes > 0 ? 100 : 0;
    } else {
      return Math.round((votes / Math.max(1, tv)) * 100);
    }
  });
  isLoading = signal(true);
  campaignNotFound = computed(() => this.campaignId() && !this.campaign());

  constructor() {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || '';
  }

  ngOnInit() {
    this.loadCampaign();
  }

  ngOnDestroy() {
    if (this.campaignId()) {
      this.campaignService.leaveCampaign(this.campaignId());
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent(event: KeyboardEvent) {
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
      if (this.activeIndex() !== null && this.campaign()?.id && !this.hasVoted(this.campaign()!.id)) {
        this.vote(this.activeIndex()!);
      }
    }
  }

  private async loadCampaign() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      return;
    }

    this.campaignId.set(id);
    this.campaignService.joinCampaign(id);

    // Always fetch the campaign to ensure we have the latest data with candidates
    this.campaignService.getCampaign(id).subscribe({
      next: (campaign) => {
        // Update the local campaigns list
        this.campaignService['_campaigns'].update(list => {
          const existingIndex = list.findIndex(c => c.id === id);
          if (existingIndex >= 0) {
            list[existingIndex] = campaign;
          } else {
            list.push(campaign);
          }
          return [...list];
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load campaign:', error);
        this.isLoading.set(false);
      }
    });

    this.loadVotedCampaigns();
    this.checkIfAlreadyVoted();
  }

  private loadVotedCampaigns() {
    this.votedCampaigns = this.storageService.getVotedCampaigns();
  }

  private checkIfAlreadyVoted() {
    if (
      this.campaign()?.id &&
      this.currentUserEmail &&
      this.storageService.hasVotedForCampaign(this.currentUserEmail, this.campaign()!.id)
    ) {
      this.showPopup = true;
    }
  }

  vote(candidateIndex: number) {
    if (!this.campaign()?.id || !this.currentUserEmail) return;
    if (this.hasVoted(this.campaign()!.id)) {
      this.showPopup = true;
      return;
    }
    this.campaignService
      .castVote(this.campaign()!.id, this.campaign()!.candidates[candidateIndex].id)
      .subscribe(() => {
        this.storageService.addVotedCampaign(this.currentUserEmail, this.campaign()!.id);

        if (!this.votedCampaigns[this.currentUserEmail]) {
          this.votedCampaigns[this.currentUserEmail] = [];
        }
        this.votedCampaigns[this.currentUserEmail].push(this.campaign()!.id);
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
    if (!this.campaign()) return;
    this.activeIndex.set(index);
    this.candidatePopupOpen = true;
  }

  closeCandidatePopup() {
    this.candidatePopupOpen = false;
    this.activeIndex.set(null);
  }

  navigateActive(offset: number) {
    if (!this.campaign() || this.activeIndex() === null) return;
    const len = this.campaign()!.candidates?.length ?? 0;
    if (len === 0) return;
    let next = (this.activeIndex()! + offset + len) % len;
    this.openCandidatePopup(next);
  }

  goBack() {
    this.router.navigate(['/user-campaign']);
  }
}
