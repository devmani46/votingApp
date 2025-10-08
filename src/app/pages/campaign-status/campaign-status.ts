import {
  Component,
  signal,
  computed,
  effect,
  HostListener,
  inject,
  DestroyRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { Router } from '@angular/router';
import { CampaignService, Campaign, Candidate } from '../../services/campaign';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { Button } from '../../components/button/button';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-campaign-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CampaignCard,
    Button,
    BurgerMenu,
    NgxEchartsModule,
    MatPaginatorModule,
  ],
  templateUrl: './campaign-status.html',
  styleUrls: ['./campaign-status.scss'],
})
export class CampaignStatus {
  private campaignService = inject(CampaignService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  viewMode = signal<'cards' | 'charts'>('cards');
  searchTerm = signal('');
  selectedCampaign = signal<Campaign | null>(null);
  campaigns = this.campaignService.campaigns;

  filteredCampaigns = computed(() => {
    const term = this.searchTerm()?.trim().toLowerCase() ?? '';
    if (!term) return this.campaigns();
    return this.campaigns().filter((c) =>
      (c.title ?? '').toLowerCase().includes(term)
    );
  });

  constructor() {
    window.addEventListener('storage', this.handleStorageChange);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('storage', this.handleStorageChange);
    });
  }

  @HostListener('window:keydown.escape')
  closeCampaignDetails() {
    this.selectedCampaign.set(null);
  }

  toggleView() {
    this.viewMode.set(this.viewMode() === 'cards' ? 'charts' : 'cards');
    this.closeCampaignDetails();
  }

  handleStorageChange = () => {
    this.campaignService.refreshCampaigns();
  };

  getCandidateVotes(campaignId: string, candidateName: string): number {
    const campaign = this.campaignService.getCampaignById(campaignId);
    if (!campaign) return 0;
    const candidate = campaign.candidates.find((c) => c.name === candidateName);
    return candidate ? candidate.votes ?? 0 : 0;
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
      ? `Draw between ${winner.candidates.map((c) => c.name).join(', ')}`
      : winner.candidates[0].name;
  }

  candidateCount(campaign: Campaign | null): number {
    return campaign ? campaign.candidates.length : 0;
  }

  getRankedCandidates(campaign: Campaign | null): Candidate[] {
    if (!campaign) return [];
    return [...campaign.candidates].sort(
      (a, b) => (b.votes ?? 0) - (a.votes ?? 0)
    );
  }

  getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  getChartOptions(campaign: Campaign | null, chartType: string = 'pie') {
    if (!campaign) return { tooltip: { show: false }, series: [] };
    const data = campaign.candidates.map((c) => ({
      name: c.name,
      value: c.votes ?? 0,
    }));

    switch (chartType) {
      case 'pie':
        return this.getPieChartOptions(campaign, data);
      case 'bar':
        return this.getBarChartOptions(campaign, data);
      case 'line':
        return this.getLineChartOptions(campaign, data);
      default:
        return this.getPieChartOptions(campaign, data);
    }
  }

  private getPieChartOptions(campaign: Campaign, data: any[]) {
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
          emphasis: {
            label: { show: true, fontSize: '14', fontWeight: '600' },
          },
          data,
        },
      ],
    };
  }

  private getBarChartOptions(campaign: Campaign, data: any[]) {
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, left: 'center' },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: { type: 'category', data: data.map((d) => d.name) },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Votes',
          type: 'bar',
          data: data.map((d) => d.value),
          itemStyle: { color: '#76affb' },
          emphasis: { itemStyle: { color: '#4a90e2' } },
        },
      ],
    };
  }

  private getLineChartOptions(campaign: Campaign, data: any[]) {
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, left: 'center' },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((d) => d.name),
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Votes',
          type: 'line',
          smooth: true,
          data: data.map((d) => d.value),
          itemStyle: { color: '#76affb' },
          areaStyle: { color: 'rgba(118, 175, 251, 0.1)' },
          emphasis: { focus: 'series' },
        },
      ],
    };
  }

  getChartTypeForIndex(index: number): string {
    const chartTypes = ['pie', 'bar', 'line'];
    return chartTypes[index % chartTypes.length];
  }

  openCampaignDetails(campaign: Campaign) {
    this.selectedCampaign.set(campaign);
  }

  exportCSV() {
    const rows: string[] = ['campaignId,title,candidateName,candidateVotes'];
    for (const c of this.campaigns()) {
      for (const cand of c.candidates) {
        rows.push(`${c.id},"${c.title}","${cand.name}",${cand.votes ?? 0}`);
      }
    }
    const blob = new Blob([rows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  editCampaign(id: string) {
    this.router.navigate(['/create-campaign', id]);
  }

  deleteCampaign(id: string) {
    this.campaignService.deleteCampaign(id).subscribe(() => {
      if (this.selectedCampaign()?.id === id) this.selectedCampaign.set(null);
    });
  }

  trackByCampaignId(index: number, item: Campaign) {
    return item.id ?? index;
  }

  trackByCandidateName(index: number, item: Candidate) {
    return item?.name ?? index;
  }

  getImage(entity: any): string {
    if (!entity) return '/assets/default-user.png';
    return (entity.banner_url ??
      entity.photo_url ??
      entity.logo ??
      entity.photo ??
      '/assets/default-user.png') as string;
  }

  pageSize = 4;
  currentPage = 0;

  pagedCampaigns() {
    const all = this.filteredCampaigns();
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return all.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  closeAllKebabMenus() {}
}
