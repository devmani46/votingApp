import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminOrModeratorGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const role = authService.getRole();

  if (role === 'admin' || role === 'moderator') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
