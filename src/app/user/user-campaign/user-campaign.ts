import {
  Component,
  inject,
  signal,
  computed,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CampaignService } from '../../services/campaign';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { Button } from '../../components/button/button';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-user-campaign',
  standalone: true,
  imports: [
    CommonModule,
    CampaignCard,
    NavBar,
    Footer,
    Button,
    MatPaginatorModule,
  ],
  templateUrl: './user-campaign.html',
  styleUrls: ['./user-campaign.scss'],
})
export class UserCampaign {
  private campaignService = inject(CampaignService);
  private router = inject(Router);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly INITIAL_DISPLAY_COUNT = 3;

  selectedCampaign = signal<any | null>(null);
  winner = signal<any | null>(null);

  showAllPast = signal(false);
  showAllAvailable = signal(false);
  showAllUpcoming = signal(false);

  campaigns = computed(() => {
    const all = this.campaignService.campaigns();
    const today = new Date();
    return all.filter(
      (c) => new Date(c.start_date) <= today && new Date(c.end_date) >= today
    );
  });

  upcomingCampaigns = computed(() => {
    const all = this.campaignService.campaigns();
    const today = new Date();
    return all.filter((c) => new Date(c.start_date) > today);
  });

  pastCampaigns = computed(() => {
    const campaigns = this.campaignService.campaigns();
    const today = new Date();
    return campaigns
      .filter((c) => new Date(c.end_date) < today)
      .map((c) => ({
        ...c,
        winner: this.campaignService.getWinner(c),
      }));
  });

  togglePast() {
    this.showAllPast.update((v) => !v);
  }

  toggleAvailable() {
    this.showAllAvailable.update((v) => !v);
  }

  toggleUpcoming() {
    this.showAllUpcoming.update((v) => !v);
  }

  openCampaign(id: string) {
    this.router.navigate(['/vote-candidate', id]);
  }

  openCampaignDetails(campaign: any) {
    this.selectedCampaign.set(campaign);
    this.winner.set(
      campaign.winner || this.campaignService.getWinner(campaign)
    );
  }

  closeCampaignDialog(event?: MouseEvent) {
    if (event && event.target !== event.currentTarget) return;
    this.selectedCampaign.set(null);
    this.winner.set(null);
  }

  getWinnerPhotoUrl(candidate: any): string {
    if (!candidate || !candidate.photo_url) return '/assets/admin.png';
    const photoUrl = candidate.photo_url.trim();
    if (photoUrl.startsWith('data:')) return photoUrl;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))
      return photoUrl;
    if (photoUrl.startsWith('/')) return photoUrl;
    return `/assets/${photoUrl}`;
  }

  getDrawNames(campaign: any): string {
    const winner = this.campaignService.getWinner(campaign);
    if (winner && winner.draw) {
      return winner.candidates.map((c: any) => c.name).join(', ');
    }
    return '';
  }

  pageSize = 4;
  currentPage = 0;

  pageSize2 = 4;
  currentPage2 = 0;

  pageSize3 = 4;
  currentPage3 = 0;

  pagedPastCampaigns() {
    const all = this.pastCampaigns();
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return all.slice(startIndex, endIndex);
  }

  pagedCurrentCampaigns() {
    const all = this.campaigns();
    const startIndex = this.currentPage2 * this.pageSize2;
    const endIndex = startIndex + this.pageSize2;
    return all.slice(startIndex, endIndex);
  }

  pagedUpcomingCampaigns() {
    const all = this.upcomingCampaigns();
    const startIndex = this.currentPage3 * this.pageSize3;
    const endIndex = startIndex + this.pageSize3;
    return all.slice(startIndex, endIndex);
  }

  onPageChangePast(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  onPageChangeCurrent(event: PageEvent) {
    this.pageSize2 = event.pageSize;
    this.currentPage2 = event.pageIndex;
  }

  onPageChangeUpcoming(event: PageEvent) {
    this.pageSize3 = event.pageSize;
    this.currentPage3 = event.pageIndex;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedCampaign() && event.key === 'Escape')
      this.closeCampaignDialog();
  }
}
