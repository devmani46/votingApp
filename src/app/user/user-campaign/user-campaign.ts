import { Component, inject,HostListener, computed } from '@angular/core';
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
  imports: [CommonModule, CampaignCard, NavBar, Footer, Button ],
  templateUrl: './user-campaign.html',
  styleUrls: ['./user-campaign.scss']
})
export class UserCampaign {
  private campaignService = inject(CampaignService);
  private router = inject(Router);

  selectedCampaign: any = null;
  winner: any = null;

  // View More/Less state
  readonly INITIAL_DISPLAY_COUNT = 3;
  showAllPast = false;
  showAllAvailable = false;
  showAllUpcoming = false;

  // Toggle methods
  togglePast() {
    this.showAllPast = !this.showAllPast;
  }

  toggleAvailable() {
    this.showAllAvailable = !this.showAllAvailable;
  }

  toggleUpcoming() {
    this.showAllUpcoming = !this.showAllUpcoming;
  }
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

  openCampaign(id: string) {
    this.router.navigate(['/vote-candidate', id]);
  }

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

    openCampaignDetails(campaign: any) {
      this.selectedCampaign = campaign;
      this.winner = campaign.winner || this.campaignService.getWinner(campaign);

      // console.log('Winner data:', this.winner);
      // if (this.winner && this.winner.candidates && this.winner.candidates.length > 0) {
      //   console.log('Winner candidate photo:', this.winner.candidates[0].photo_url);
      //   console.log('Winner candidate photo type:', typeof this.winner.candidates[0].photo_url);
      //   console.log('Winner candidate photo length:', this.winner.candidates[0].photo_url?.length);
      // }
    }

    getWinnerPhotoUrl(candidate: any): string {
      if (!candidate || !candidate.photo_url) {
        return '/assets/admin.png';
      }

      const photoUrl = candidate.photo_url.trim();

      // If it's a base64 data URL, return it as is
      if (photoUrl.startsWith('data:')) {
        return photoUrl;
      }

      // If it's a regular URL, return it
      if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl;
      }

      // If it's a relative path, return it
      if (photoUrl.startsWith('/')) {
        return photoUrl;
      }

      // If it's just a filename, assume it's in assets
      return `/assets/${photoUrl}`;
    }

    closeCampaignDialog(event?: MouseEvent) {
      if (event && event.target !== event.currentTarget) return;
      this.selectedCampaign = null;
      this.winner = null;
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
        if (this.selectedCampaign && event.key === 'Escape') this.closeCampaignDialog();
      }
}
