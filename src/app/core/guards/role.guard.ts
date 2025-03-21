// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, take } from 'rxjs';
import { selectCurrentUser } from '../../store/user/user.selectors';

// Update your User model to only use string[] for roles
// src/app/models/user.ts
// export interface User {
//   email: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   roles: string[]; // Array only, no Set
// }

export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return (): Observable<boolean | UrlTree> => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectCurrentUser).pipe(
      take(1),
      map(user => {
        // No user, redirect to login
        console.log(user);
        if (!user) {
          return router.createUrlTree(['/login']);
        }

        // Simple array check - assuming roles is always string[]
        const hasRequiredRole = requiredRoles.some(role =>
          Array.isArray(user.roles) && user.roles.includes(role)
        );

        return hasRequiredRole ? true : router.createUrlTree(['/login']);
      })
    );
  };
}
