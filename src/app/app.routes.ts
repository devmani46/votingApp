import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { CampaignStatus } from './pages/campaign-status/campaign-status';
import { Menu } from './pages/menu/menu';
import { CreateCampaign } from './pages/create-campaign/create-campaign';
import { Notifications } from './pages/notifications/notifications';
import { Reports } from './pages/reports/reports';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'menu', component: Menu },
  { path: 'campaign-status', component: CampaignStatus },
  { path: 'create-campaign', component: CreateCampaign },
  { path: 'notifications', component: Notifications },
  { path: 'reports', component: Reports },
  { path: '**', redirectTo: 'login' },
];
