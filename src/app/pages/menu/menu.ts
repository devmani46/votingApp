import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CampaignService, Campaign } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { UserService, User } from '../../services/user';
import { ModeratorService, Moderator } from '../../services/moderator';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { DetailCards } from '../../components/detail-cards/detail-cards';
import { Signal } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BurgerMenu, DetailCards],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class Menu implements OnDestroy, OnInit {
  campaigns: Signal<Campaign[]>;
  users: Signal<User[]>;
  moderators: Signal<Moderator[]>;

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private userService: UserService,
    private moderatorService: ModeratorService,
    private router: Router
  ) {
    this.campaigns = this.campaignService.campaigns;
    this.users = this.userService.getUsersSignal();
    this.moderators = this.moderatorService.getModeratorsSignal();
    window.addEventListener('storage', this.handleStorageChange);
  }

  ngOnInit() {
    this.userService.getAll().subscribe();
    this.moderatorService.getAll().subscribe();
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = () => {
    this.campaignService.refreshCampaigns();
  };

  get totalUsers(): number {
    return this.users().length;
  }

  get totalModerators(): number {
    return this.moderators().length;
  }

  get totalCampaigns(): number {
    return this.campaigns().length;
  }

  get totalCandidates(): number {
    return this.campaigns().reduce((sum, c) => sum + (c.candidates?.length || 0), 0);
  }

  get totalVotes(): number {
    return this.campaigns().reduce(
      (sum, c) => sum + (c.candidates?.reduce((s, cand) => s + (cand.votes ?? 0), 0) || 0),
      0
    );
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
