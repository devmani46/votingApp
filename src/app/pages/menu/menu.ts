import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { Router } from '@angular/router';

import { CampaignService, Campaign } from '../../services/campaign';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';
import { DetailCards } from '../../components/detail-cards/detail-cards';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CampaignCard,
    Button,
    BurgerMenu,
    NgxEchartsModule,
    DetailCards
  ],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class Menu {
  viewMode: 'cards' | 'charts' = 'cards';
  searchTerm = '';
  selectedCampaign: Campaign | null = null;
  campaigns: Campaign[] = [];

  constructor(private campaignService: CampaignService, private router: Router) {
    this.loadCampaigns();
  }

  loadCampaigns() {
    const svc = this.campaignService as any;
    if (typeof svc.getAllCampaigns === 'function') {
      try {
        this.campaigns = svc.getAllCampaigns() ?? [];
      } catch {
        this.campaigns = [];
      }
    } else {
      const stored = localStorage.getItem('campaigns');
      if (stored) {
        try {
          this.campaigns = JSON.parse(stored);
        } catch {
          this.campaigns = [];
        }
      } else {
        this.campaigns = [];
      }
    }
  }
  get totalUsers(): number {
    const stored = localStorage.getItem('users');
    try {
      const arr = stored ? JSON.parse(stored) : [];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  get totalEmployees(): number {
    const stored = localStorage.getItem('employees');
    try {
      const arr = stored ? JSON.parse(stored) : [];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  get totalEvents(): number {
    const stored = localStorage.getItem('events');
    try {
      const arr = stored ? JSON.parse(stored) : [];
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  get totalCampaigns(): number {
    return Array.isArray(this.campaigns) ? this.campaigns.length : 0;
  }

  get totalCandidates(): number {
    let cnt = 0;
    for (const c of (this.campaigns || [])) {
      if (Array.isArray(c.candidates)) cnt += c.candidates.length;
    }
    return cnt;
  }

  get totalVotes(): number {
    let v = 0;
    for (const c of (this.campaigns || [])) {
      if (Array.isArray(c.candidates)) {
        for (const cand of c.candidates) {
          v += (cand.votes ?? 0);
        }
      }
    }
    return v;
  }

  filteredCampaigns(): Campaign[] {
    const term = this.searchTerm?.trim().toLowerCase() ?? '';
    if (!term) return this.campaigns;
    return this.campaigns.filter(c => (c.title ?? '').toLowerCase().includes(term));
  }

  getTotalVotes(campaign: Campaign | null): number {
    if (!campaign) return 0;
    const arr = Array.isArray(campaign.candidates) ? campaign.candidates : [];
    return arr.reduce((s, c) => s + (c.votes ?? 0), 0);
  }

  getTopCandidate(campaign: Campaign | null) {
    if (!campaign) return null;
    const arr = Array.isArray(campaign.candidates) ? campaign.candidates.slice() : [];
    if (!arr.length) return null;
    arr.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    return arr[0];
  }

  getImage(entity: any): string {
    if (!entity) return '/assets/default-user.png';
    return entity.logo ?? entity.photo ?? '/assets/default-user.png';
  }

  candidateCount(campaign: Campaign | null): number {
    if (!campaign) return 0;
    return Array.isArray(campaign.candidates) ? campaign.candidates.length : 0;
  }

  toggleView() {
    this.viewMode = this.viewMode === 'cards' ? 'charts' : 'cards';
    this.closeCampaignDetails();
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
          const votes = cand.votes ?? 0;
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

  openCampaignDetails(campaign: Campaign) {
    this.selectedCampaign = campaign;
  }

  closeCampaignDetails() {
    this.selectedCampaign = null;
  }

  trackByCampaignId(index: number, item: Campaign) {
    return (item && (item as any).id) ?? index;
  }

  trackByCandidateName(index: number, item: any) {
    return (item && item.name) ?? index;
  }

  getChartOptions(campaign: Campaign | null) {
    if (!campaign) {
      return {
        tooltip: { show: false },
        series: []
      };
    }
    const data = (Array.isArray(campaign.candidates) ? campaign.candidates : []).map(c => ({ name: c.name, value: c.votes ?? 0 }));
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

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
