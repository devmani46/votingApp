import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { CampaignStatus } from './pages/campaign-status/campaign-status';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'campaign-status', component: CampaignStatus },
  { path: '**', redirectTo: 'login' },
];
