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

  handleStorageChange = (event: StorageEvent) => {
    if (!event?.key) {
      this.loadCampaigns();
      return;
    }
    if (event.key === 'campaigns' || event.key === 'campaigns_updated' || event.key.startsWith('votes_')) {
      this.loadCampaigns();
    }
  };

  loadCampaigns() {
    this.campaigns = this.campaignService.getAllCampaigns();
  }

  filteredCampaigns(): Campaign[] {
    const term = this.searchTerm?.trim().toLowerCase() ?? '';
    if (!term) return this.campaigns;
    return this.campaigns.filter(c => (c.title ?? '').toLowerCase().includes(term));
  }

  generateVoteKeys(campaignId: any, candidateName: string) {
    const enc = encodeURIComponent(candidateName);
    return [
      `votes_${campaignId}_${enc}`,
      `votes_${campaignId}_${candidateName}`,
      `votes_${campaignId}_${candidateName.toLowerCase()}`
    ];
  }

  getCandidateVotes(campaignId: any, candidateName: string): number {
    if (campaignId == null || candidateName == null) return 0;
    const keys = this.generateVoteKeys(campaignId, candidateName);
    for (const k of keys) {
      const stored = localStorage.getItem(k);
      if (stored != null) {
        const n = parseInt(stored, 10);
        return Number.isFinite(n) ? n : 0;
      }
    }
    const camp = this.campaigns.find(c => (c as any).id === campaignId);
    if (camp && Array.isArray(camp.candidates)) {
      const cand = camp.candidates.find((x: any) => x.name === candidateName);
      return cand ? (cand.votes ?? 0) : 0;
    }
    return 0;
  }

  getTotalVotes(campaign: Campaign | null): number {
    if (!campaign) return 0;
    const arr = Array.isArray(campaign.candidates) ? campaign.candidates : [];
    return arr.reduce((s, c) => s + this.getCandidateVotes((campaign as any).id, c.name), 0);
  }
  getTopCandidate(campaign: Campaign | null): string {
    if (!campaign || !Array.isArray(campaign.candidates) || campaign.candidates.length === 0) {
      return '—';
    }

    const candidatesWithVotes = campaign.candidates.map(c => ({
      ...c,
      votes: this.getCandidateVotes((campaign as any).id, c.name)
    }));

    candidatesWithVotes.sort((a, b) => b.votes - a.votes);

    const topVotes = candidatesWithVotes[0].votes;
    const topCandidates = candidatesWithVotes.filter(c => c.votes === topVotes);

    if (topCandidates.length === 1) {
      return topCandidates[0].name;
    }

    return `Draw between ${topCandidates.map(c => c.name).join(', ')}`;
  }

  candidateCount(campaign: Campaign | null): number {
    if (!campaign) return 0;
    return Array.isArray(campaign.candidates) ? campaign.candidates.length : 0;
  }

  getRankedCandidates(campaign: Campaign | null): Candidate[] {
    if (!campaign || !Array.isArray(campaign.candidates)) return [];
    return [...campaign.candidates].sort((a, b) =>
      this.getCandidateVotes((campaign as any).id, b.name) - this.getCandidateVotes((campaign as any).id, a.name)
    );
  }

  getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  getChartOptions(campaign: Campaign | null) {
    if (!campaign) return { tooltip: { show: false }, series: [] };
    const data = (Array.isArray(campaign.candidates) ? campaign.candidates : []).map(c => ({
      name: c.name,
      value: this.getCandidateVotes((campaign as any).id, c.name)
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
    const rows: string[] = [];
    rows.push('campaignId,title,candidateName,candidateVotes');
    for (const c of this.campaigns) {
      const cid = (c as any).id ?? '';
      const title = (c.title ?? '').replace(/"/g, '""');
      const candidates = Array.isArray(c.candidates) ? c.candidates : [];
      if (candidates.length) {
        for (const cand of candidates) {
          const name = (cand.name ?? '').replace(/"/g, '""');
          const votes = this.getCandidateVotes(cid, cand.name);
          rows.push(`${cid},"${title}","${name}",${votes}`);
        }
      } else {
        rows.push(`${cid},"${title}","",0`);
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
    if (this.selectedCampaign && (this.selectedCampaign as any).id === id) this.selectedCampaign = null;
  }

  trackByCampaignId(index: number, item: Campaign) {
    return (item as any).id ?? index;
  }

  trackByCandidateName(index: number, item: Candidate) {
    return item?.name ?? index;
  }

  getImage(entity: any): string {
    if (!entity) return '/assets/default-user.png';
    return (entity.logo ?? entity.photo ?? '/assets/default-user.png') as string;
  }
}
