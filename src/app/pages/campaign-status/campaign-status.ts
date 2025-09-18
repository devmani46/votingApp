import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { Router } from '@angular/router';
import { CampaignService, Campaign, Candidate } from '../../services/campaign';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-campaign-status',
  standalone: true,
  imports: [CommonModule, FormsModule, CampaignCard, Button, BurgerMenu, NgxEchartsModule],
  templateUrl: './campaign-status.html',
  styleUrls: ['./campaign-status.scss']
})
export class CampaignStatus implements OnDestroy {
  private campaignService = inject(CampaignService);
  private router = inject(Router);

  viewMode: 'cards' | 'charts' = 'cards';
  searchTerm = '';
  selectedCampaign: Campaign | null = null;
  campaigns: Campaign[] = [];

  constructor() {
    this.loadCampaigns();
    window.addEventListener('storage', this.handleStorageChange);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  toggleView() {
    this.viewMode = this.viewMode === 'cards' ? 'charts' : 'cards';
    this.closeCampaignDetails();
  }

  handleStorageChange = () => {
    this.loadCampaigns();
  };

  loadCampaigns() {
    this.campaigns = this.campaignService.getAllCampaigns();
  }

  filteredCampaigns(): Campaign[] {
    const term = this.searchTerm?.trim().toLowerCase() ?? '';
    if (!term) return this.campaigns;
    return this.campaigns.filter(c => (c.title ?? '').toLowerCase().includes(term));
  }

  getCandidateVotes(campaignId: number, candidateName: string): number {
    const campaign = this.campaignService.getCampaignById(campaignId);
    if (!campaign) return 0;
    const candidate = campaign.candidates.find(c => c.name === candidateName);
    return candidate ? (candidate.votes ?? 0) : 0;
  }

  getTotalVotes(campaign: Campaign | null): number {
    if (!campaign) return 0;
    return campaign.candidates.reduce((s, c) => s + (c.votes ?? 0), 0);
  }

  getTopCandidate(campaign: Campaign | null): string {
    if (!campaign || campaign.candidates.length === 0) return '—';
    const winner = this.campaignService.getWinner(campaign);
    if (!winner) return '—';
    return winner.draw
      ? `Draw between ${winner.candidates.map(c => c.name).join(', ')}`
      : winner.candidates[0].name;
  }

  candidateCount(campaign: Campaign | null): number {
    return campaign ? campaign.candidates.length : 0;
  }

  getRankedCandidates(campaign: Campaign | null): Candidate[] {
    if (!campaign) return [];
    return [...campaign.candidates].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  }

  getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  getChartOptions(campaign: Campaign | null) {
    if (!campaign) return { tooltip: { show: false }, series: [] };
    const data = campaign.candidates.map(c => ({
      name: c.name,
      value: c.votes ?? 0
    }));
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center' },
      series: [
        {
          name: campaign.title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: '14', fontWeight: '600' } },
          data
        }
      ]
    };
  }

  openCampaignDetails(campaign: Campaign) {
    this.selectedCampaign = campaign;
  }

  closeCampaignDetails() {
    this.selectedCampaign = null;
  }

  exportCSV() {
    const rows: string[] = ['campaignId,title,candidateName,candidateVotes'];
    for (const c of this.campaigns) {
      for (const cand of c.candidates) {
        rows.push(`${c.id},"${c.title}","${cand.name}",${cand.votes ?? 0}`);
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  editCampaign(id: number) {
    this.router.navigate(['/create-campaign', id]);
  }

  deleteCampaign(id: number) {
    this.campaignService.deleteCampaign(id);
    this.loadCampaigns();
    if (this.selectedCampaign?.id === id) this.selectedCampaign = null;
  }

  trackByCampaignId(index: number, item: Campaign) {
    return item.id ?? index;
  }

  trackByCandidateName(index: number, item: Candidate) {
    return item?.name ?? index;
  }

  getImage(entity: any): string {
    if (!entity) return '/assets/default-user.png';
    return (entity.logo ?? entity.photo ?? '/assets/default-user.png') as string;
  }
}


