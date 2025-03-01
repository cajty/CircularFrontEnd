import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const userId = localStorage.getItem('user-id');
  const router = new Router();

  if (userId) {
    return true;
  } else {
    router.navigate(['/user/login']);
    return false;
  }
};
