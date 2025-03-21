import { inject } from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import { Store } from '@ngrx/store';
import {map, Observable, take, tap} from 'rxjs';
import {selectCurrentUser, selectUserRoles} from '../../store/user/user.selectors';


export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return (): Observable<boolean | UrlTree> => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectUserRoles).pipe(
      take(1),
      map(userRoles => {
        // Check if user has any of the required roles
        const hasAnyRequiredRole = requiredRoles.some(role => userRoles.has(role));

        if (hasAnyRequiredRole) {
          return true;
        } else {
          // Redirect to login page if not authorized
          return router.createUrlTree(['/login']);
        }
      })
    );
  };
}
