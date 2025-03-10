import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const userId = localStorage.getItem('auth-token');
  const router = new Router();

  if (userId) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
