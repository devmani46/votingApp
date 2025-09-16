import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CampaignService } from '../../services/campaign';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-user-campaign',
  standalone: true,
  imports: [CommonModule, CampaignCard, NavBar, Footer],
  templateUrl: './user-campaign.html',
  styleUrls: ['./user-campaign.scss']
})
export class UserCampaign {
  private campaignService = inject(CampaignService);
  private router = inject(Router);

  campaigns = computed(() => {
    const all = this.campaignService.campaigns();
    const today = new Date();
    return all.filter(c => new Date(c.startDate) <= today && new Date(c.endDate) >= today);
  });

  upcomingCampaigns = computed(() => {
    const all = this.campaignService.campaigns();
    const today = new Date();
    return all.filter(c => new Date(c.startDate) > today);
  });

  openCampaign(id: number) {
    this.router.navigate(['/vote-candidate', id]);
  }
}
