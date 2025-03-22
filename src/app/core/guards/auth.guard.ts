import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth-token');


  if (token) {
    return true;
  }

  sessionStorage.setItem('redirectUrl', state.url);
  return router.createUrlTree(['/auth/login']);
};
