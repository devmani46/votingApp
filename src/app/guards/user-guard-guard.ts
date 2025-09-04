import { CanActivateFn, Router } from '@angular/router';

export const userGuard: CanActivateFn = (route, state) => {
  const role = localStorage.getItem('role');
  const router = new Router();

  if (role === 'user') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
