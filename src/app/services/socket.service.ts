import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private campaignCreatedSubject = new Subject<any>();
  private campaignUpdatedSubject = new Subject<any>();
  private campaignDeletedSubject = new Subject<any>();
  private voteUpdatedSubject = new Subject<any>();
  private candidateAddedSubject = new Subject<any>();
  private candidateRemovedSubject = new Subject<any>();
  private candidateUpdatedSubject = new Subject<any>();

  constructor() {}

  connect(): void {
    if (this.socket) return;

    this.socket = io('http://localhost:4000', {
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('campaign:created', (data) => {
      this.campaignCreatedSubject.next(data);
    });

    this.socket.on('campaign:updated', (data) => {
      this.campaignUpdatedSubject.next(data);
    });

    this.socket.on('campaign:deleted', (data) => {
      this.campaignDeletedSubject.next(data);
    });

    this.socket.on('vote:updated', (data) => {
      this.voteUpdatedSubject.next(data);
    });

    this.socket.on('candidate:added', (data) => {
      this.candidateAddedSubject.next(data);
    });

    this.socket.on('candidate:removed', (data) => {
      this.candidateRemovedSubject.next(data);
    });

    this.socket.on('candidate:updated', (data) => {
      this.candidateUpdatedSubject.next(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinCampaign(campaignId: string): void {
    if (this.socket) {
      this.socket.emit('joinCampaign', campaignId);
    }
  }

  leaveCampaign(campaignId: string): void {
    if (this.socket) {
      this.socket.emit('leaveCampaign', campaignId);
    }
  }

  joinAdmin(): void {
    if (this.socket) {
      this.socket.emit('joinAdmin');
    }
  }

  onCampaignCreated(): Observable<any> {
    return this.campaignCreatedSubject.asObservable();
  }

  onCampaignUpdated(): Observable<any> {
    return this.campaignUpdatedSubject.asObservable();
  }

  onCampaignDeleted(): Observable<any> {
    return this.campaignDeletedSubject.asObservable();
  }

  onVoteUpdated(): Observable<any> {
    return this.voteUpdatedSubject.asObservable();
  }

  onCandidateAdded(): Observable<any> {
    return this.candidateAddedSubject.asObservable();
  }

  onCandidateRemoved(): Observable<any> {
    return this.candidateRemovedSubject.asObservable();
  }

  onCandidateUpdated(): Observable<any> {
    return this.candidateUpdatedSubject.asObservable();
  }
}
