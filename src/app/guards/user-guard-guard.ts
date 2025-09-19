import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const userGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const role = authService.getRole();
  if (role === 'voter' || role === 'user') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
