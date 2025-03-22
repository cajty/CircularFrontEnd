// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // No need to check roles if no roles are required
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get current user
    return authService.currentUser$.pipe(
      map(user => {
        // If no user or no roles, deny access
        if (!user || !user.roles || user.roles.length === 0) {
          router.navigate(['/auth/login']);
          return false;
        }

        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role =>
          user.roles.includes(role)
        );

        if (hasRequiredRole) {
          return true;
        }

        const defaultRoute = user.roles.includes('ADMIN')
          ? '/admin/categories'
          : user.roles.includes('MANAGER')
            ? '/manager/locations'
            : '/auth/login';

        router.navigate([defaultRoute]);
        return false;
      }),
      catchError(() => {
        router.navigate(['/auth/login']);
        return of(false);
      })
    );
  };
}
