import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { CampaignService } from '../../services/campaign';

@Component({
  selector: 'app-campaign-status',
  standalone: true,
  imports: [CommonModule, CampaignCard, BurgerMenu],
  templateUrl: './campaign-status.html',
  styleUrls: ['./campaign-status.scss']
})
export class CampaignStatus {
  private campaignService = inject(CampaignService);
  campaigns = this.campaignService.campaigns;
}
