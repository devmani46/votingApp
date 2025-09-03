import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu').then(m => m.Menu),
  },
  {
    path: 'campaign-status',
    loadComponent: () => import('./pages/campaign-status/campaign-status').then(m => m.CampaignStatus),
  },
  {
    path: 'create-campaign',
    loadComponent: () => import('./pages/create-campaign/create-campaign').then(m => m.CreateCampaign),
  },
  {
    path: 'create-campaign/:id',
    loadComponent: () => import('./pages/create-campaign/create-campaign').then(m => m.CreateCampaign),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications),
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then(m => m.Reports),
  },
  { path: '**', redirectTo: 'login' },
];
