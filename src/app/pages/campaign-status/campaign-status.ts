import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CampaignCard } from '../../components/campaign-card/campaign-card';

@Component({
  selector: 'app-campaign-status',
  standalone: true,
  imports: [CommonModule, CampaignCard],
  templateUrl: './campaign-status.html',
  styleUrl: './campaign-status.scss'
})
export class CampaignStatus {}
