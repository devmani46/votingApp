import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const role = authService.getRole();
  if (role === 'admin') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
