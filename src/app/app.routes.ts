import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { userGuard } from './guards/user-guard-guard';
import { moderatorGuard } from './guards/moderator-guard';
import { adminOrModeratorGuard } from './guards/admin-or-moderator-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
  },

  {
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu').then((m) => m.Menu),
    canActivate: [adminGuard],
  },

  {
    path: 'campaign-status',
    loadComponent: () =>
      import('./pages/campaign-status/campaign-status').then(
        (m) => m.CampaignStatus
      ),
    canActivate: [adminOrModeratorGuard],
  },
  {
    path: 'create-campaign',
    loadComponent: () =>
      import('./pages/create-campaign/create-campaign').then(
        (m) => m.CreateCampaign
      ),
    canActivate: [adminOrModeratorGuard],
  },
  {
    path: 'create-campaign/:id',
    loadComponent: () =>
      import('./pages/create-campaign/create-campaign').then(
        (m) => m.CreateCampaign
      ),
    canActivate: [adminOrModeratorGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./pages/notifications/notifications').then(
        (m) => m.Notifications
      ),
    canActivate: [adminOrModeratorGuard],
  },
  // {
  //   path: 'reports',
  //   loadComponent: () => import('./pages/reports/reports').then(m => m.Reports),
  //   canActivate: [adminOrModeratorGuard],
  // },

  {
    path: 'user-management',
    loadComponent: () =>
      import('./admin/user-management/user-management').then(
        (m) => m.UserManagement
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'moderator-management',
    loadComponent: () =>
      import('./admin/moderator-management/moderator-management').then(
        (m) => m.ModeratorManagement
      ),
    canActivate: [adminGuard],
  },

  {
    path: 'user-page',
    loadComponent: () =>
      import('./user/user-page/user-page').then((m) => m.UserPage),
    canActivate: [userGuard],
  },
  {
    path: 'user-campaign',
    loadComponent: () =>
      import('./user/user-campaign/user-campaign').then((m) => m.UserCampaign),
    canActivate: [userGuard],
  },
  {
    path: 'vote-candidate/:id',
    loadComponent: () =>
      import('./user/vote-candidate/vote-candidate').then(
        (m) => m.VoteCandidate
      ),
    canActivate: [userGuard],
  },

  { path: '**', redirectTo: 'login' },
];
