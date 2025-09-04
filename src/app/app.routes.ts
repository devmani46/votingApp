import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

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
    canActivate: [authGuard],
  },
  {
    path: 'campaign-status',
    loadComponent: () => import('./pages/campaign-status/campaign-status').then(m => m.CampaignStatus),
    canActivate: [authGuard],
  },
  {
    path: 'create-campaign',
    loadComponent: () => import('./pages/create-campaign/create-campaign').then(m => m.CreateCampaign),
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications),
    canActivate: [authGuard],
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then(m => m.Reports),
    canActivate: [authGuard],
  },
  {
    path: 'user-management',
    loadComponent: () => import('./admin/user-management/user-management').then(m => m.UserManagement),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: 'login' },
];
