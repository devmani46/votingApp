import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SocketService } from './socket.service';

export interface Candidate {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
  votes?: number;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  candidates: Candidate[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = 'http://localhost:4000/api';
  private _campaigns = signal<Campaign[]>([]);
  campaigns = this._campaigns.asReadonly();

  constructor(private http: HttpClient, private socketService: SocketService) {
    this.socketService.connect();
    this.loadCampaigns();
    this.setupRealtimeListeners();
  }

  private setupRealtimeListeners(): void {
    this.socketService.onCampaignCreated().subscribe(data => {
      const newCampaign = { ...data, candidates: data.candidates || [] };
      this._campaigns.update(list => [...list, newCampaign]);
    });

    this.socketService.onCampaignUpdated().subscribe(data => {
      this._campaigns.update(list =>
        list.map(c => c.id === data.id ? data : c)
      );
    });

    this.socketService.onCampaignDeleted().subscribe(data => {
      this._campaigns.update(list => list.filter(c => c.id !== data.id));
    });

    this.socketService.onVoteUpdated().subscribe(data => {
      console.log('Received vote:updated event:', data);
      this._campaigns.update(list =>
        list.map(c => {
          if (c.id === data.campaignId) {
            return {
              ...c,
              candidates: c.candidates.map(cd => ({ ...cd, votes: data.votes[cd.id] || 0 }))
            };
          }
          return c;
        })
      );
    });

    this.socketService.onCandidateAdded().subscribe(data => {
      console.log('Received candidate:added event:', data);
      this._campaigns.update(list =>
        list.map(c => {
          if (c.id === data.campaignId) {
            return { ...c, candidates: [...c.candidates, data.candidate] };
          }
          return c;
        })
      );
    });

    this.socketService.onCandidateRemoved().subscribe(data => {
      this._campaigns.update(list =>
        list.map(c => {
          if (c.id === data.campaignId) {
            return { ...c, candidates: c.candidates.filter(cd => cd.id !== data.candidateId) };
          }
          return c;
        })
      );
    });

    this.socketService.onCandidateUpdated().subscribe(data => {
      this._campaigns.update(list =>
        list.map(c => {
          if (c.id === data.campaignId) {
            return { ...c, candidates: c.candidates.map(cd => cd.id === data.candidateId ? { ...cd, ...data.changes } : cd) };
          }
          return c;
        })
      );
    });
  }

  private loadCampaigns() {
    this.http.get<Campaign[]>(`${this.apiUrl}/campaigns`).subscribe({
      next: campaigns => {
        const normalized = campaigns.map(c => ({ ...c, candidates: c.candidates || [] }));
        this._campaigns.set(normalized);
      },
      error: error => {
        console.error('Failed to load campaigns:', error);
        this._campaigns.set([]);
      }
    });
  }

  refreshCampaigns() {
    this.loadCampaigns();
  }

  getAllCampaigns(): Campaign[] {
    return [...this._campaigns()];
  }

  getCampaignById(id: string): Campaign | undefined {
    const campaign = this._campaigns().find(c => c.id === id);
    if (campaign && !Array.isArray(campaign.candidates)) {
      campaign.candidates = [];
    }
    return campaign;
  }

  addCampaign(campaign: Omit<Campaign, 'id' | 'candidates'>): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.apiUrl}/campaigns`, campaign, { withCredentials: true }).pipe(
      tap(newCampaign => {
        newCampaign.candidates = newCampaign.candidates || [];
        this._campaigns.update(list => [...list, newCampaign]);
      })
    );
  }

  updateCampaign(id: string, updated: Partial<Campaign>): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/campaigns/${id}`, updated, { withCredentials: true }).pipe(
      tap(updatedCampaign => {
        updatedCampaign.candidates = updatedCampaign.candidates || [];
        this._campaigns.update(list =>
          list.map(c => (c.id === id ? updatedCampaign : c))
        );
      })
    );
  }

  deleteCampaign(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this._campaigns.update(list => list.filter(c => c.id !== id));
      })
    );
  }

  addCandidate(campaignId: string, candidate: Omit<Candidate, 'id'>): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.apiUrl}/campaigns/${campaignId}/candidates`, candidate, { withCredentials: true }).pipe(
      tap(newCandidate => {
        this._campaigns.update(list =>
          list.map(c => {
            if (c.id === campaignId) {
              c.candidates = c.candidates || [];
              return { ...c, candidates: [...c.candidates, newCandidate] };
            }
            return c;
          })
        );
      })
    );
  }

  deleteCandidate(campaignId: string, candidateId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${campaignId}/candidates/${candidateId}`, { withCredentials: true });
  }

  updateCandidate(campaignId: string, candidateId: string, candidate: Partial<Candidate>): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/campaigns/${campaignId}/candidates/${candidateId}`, candidate, { withCredentials: true }).pipe(
      tap(updatedCandidate => {
        this._campaigns.update(list =>
          list.map(c => {
            if (c.id === campaignId) {
              c.candidates = c.candidates || [];
              return { ...c, candidates: c.candidates.map(cd => cd.id === candidateId ? updatedCandidate : cd) };
            }
            return c;
          })
        );
      })
    );
  }

  castVote(campaignId: string, candidateId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/campaigns/${campaignId}/vote`, { candidate_id: candidateId }, { withCredentials: true }).pipe(
      tap(() => {
        // Optionally refresh campaigns or update votes locally
        this.loadCampaigns();
      })
    );
  }

  getWinner(campaign: Campaign): { candidates: Candidate[]; draw: boolean } | null {
    if (!campaign || campaign.candidates.length === 0) return null;

    const maxVotes = Math.max(...campaign.candidates.map(c => c.votes ?? 0));
    const winners = campaign.candidates.filter(c => (c.votes ?? 0) === maxVotes);

    return {
      candidates: winners,
      draw: winners.length > 1
    };
  }

  joinCampaign(campaignId: string): void {
    this.socketService.joinCampaign(campaignId);
  }

  leaveCampaign(campaignId: string): void {
    this.socketService.leaveCampaign(campaignId);
  }

  getCampaign(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/campaigns/${id}`, { withCredentials: true });
  }
}
//
