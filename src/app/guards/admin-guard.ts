import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role !== 'admin') {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
