// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { selectCurrentUser } from '../../store/user/user.selectors';
import { AuthService } from '../services/auth/auth.service';

export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return (route, state): Observable<boolean | UrlTree> => {
    const store = inject(Store);
    const router = inject(Router);
    const authService = inject(AuthService);

    // Prevent redirect loops - if we're already trying to access login/register pages
    const isAuthRoute = state.url.includes('/auth/') ||
                        state.url.includes('/login') ||
                        state.url.includes('/register');

    if (isAuthRoute) {
      return of(true); // Always allow access to auth routes
    }

    return store.select(selectCurrentUser).pipe(
      take(1),
      switchMap(user => {
        // If no user is found, redirect to login
        if (!user) {
          return of(router.createUrlTree(['/auth/login']));
        }

        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role =>
          user.roles?.includes(role)
        );

        if (hasRequiredRole) {
          return of(true);
        } else {
          // Store current URL to redirect back after proper authentication
          localStorage.setItem('redirectUrl', state.url);

          // Get appropriate route based on user's role
          return authService.getRouteBasedOnRole().pipe(
            map(route => {
              console.log(`User lacks required role. Redirecting to: ${route}`);
              return router.createUrlTree([route]);
            })
          );
        }
      })
    );
  };
}
