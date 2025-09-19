import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CampaignService, Campaign } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { DetailCards } from '../../components/detail-cards/detail-cards';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BurgerMenu, DetailCards],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class Menu implements OnDestroy {
  campaigns: Campaign[] = [];

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadCampaigns();
    window.addEventListener('storage', this.handleStorageChange);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = () => {
    this.loadCampaigns();
  };

  loadCampaigns() {
    this.campaigns = this.campaignService.getAllCampaigns();
  }

  get totalUsers(): number {
    // For now, return 0 since we don't have user count from backend
    // TODO: Implement user count from backend
    return 0;
  }

  get totalCampaigns(): number {
    return this.campaigns.length;
  }

  get totalCandidates(): number {
    return this.campaigns.reduce((sum, c) => sum + (c.candidates?.length || 0), 0);
  }

  get totalVotes(): number {
    return this.campaigns.reduce(
      (sum, c) => sum + (c.candidates?.reduce((s, cand) => s + (cand.votes ?? 0), 0) || 0),
      0
    );
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
