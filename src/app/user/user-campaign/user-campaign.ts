import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CampaignService } from '../../services/campaign';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { Button } from '../../components/button/button';

@Component({
  selector: 'app-user-campaign',
  standalone: true,
  imports: [CommonModule, CampaignCard, NavBar, Footer, Button],
  templateUrl: './user-campaign.html',
  styleUrls: ['./user-campaign.scss']
})
export class UserCampaign {
  private campaignService = inject(CampaignService);
  private router = inject(Router);

  readonly INITIAL_DISPLAY_COUNT = 3;

  selectedCampaignId = signal<string>('');
  selectedCampaign = computed(() => this.campaignService.campaigns().find(c => c.id === this.selectedCampaignId()));
  winner = computed(() => this.selectedCampaign() ? this.campaignService.getWinner(this.selectedCampaign()!) : null);

  showAllPast = signal(false);
  showAllAvailable = signal(false);
  showAllUpcoming = signal(false);

  campaigns = computed(() => {
    const all = this.campaignService.campaigns();
    const today = new Date();
    return all.filter(c => new Date(c.start_date) <= today && new Date(c.end_date) >= today);
  });

  upcomingCampaigns = computed(() => {
    const all = this.campaignService.campaigns();
    const today = new Date();
    return all.filter(c => new Date(c.start_date) > today);
  });

  pastCampaigns = computed(() => {
    const campaigns = this.campaignService.campaigns();
    const today = new Date();
    return campaigns
      .filter(c => new Date(c.end_date) < today)
      .map(c => ({
        ...c,
        winner: this.campaignService.getWinner(c)
      }));
  });

  togglePast() {
    this.showAllPast.update(v => !v);
  }

  toggleAvailable() {
    this.showAllAvailable.update(v => !v);
  }

  toggleUpcoming() {
    this.showAllUpcoming.update(v => !v);
  }

  openCampaign(id: string) {
    this.router.navigate(['/vote-candidate', id]);
  }

  openCampaignDetails(campaign: any) {
    this.selectedCampaignId.set(campaign.id);
  }

  closeCampaignDialog(event?: MouseEvent) {
    if (event && event.target !== event.currentTarget) return;
    this.selectedCampaignId.set('');
  }

  getWinnerPhotoUrl(candidate: any): string {
    if (!candidate || !candidate.photo_url) return '/assets/admin.png';
    const photoUrl = candidate.photo_url.trim();
    if (photoUrl.startsWith('data:')) return photoUrl;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedCampaign() && event.key === 'Escape') this.closeCampaignDialog();
  }
}
