import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';

export const publicGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth-token');

  if (!token) {
    return true;
  }
  return router.createUrlTree(['/profile']);
};
