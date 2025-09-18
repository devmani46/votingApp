import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage';

export const userGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storage = inject(StorageService);
  const role = storage.getRole();

  if (role === 'user') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
