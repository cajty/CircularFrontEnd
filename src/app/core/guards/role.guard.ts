// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { User } from '../../models/user';

export function roleGuard(requiredRoles: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);


    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }


    return authService.storeCurrentUser$.pipe(
      map((user: User | null) => {
        if (!user || !user.roles || user.roles.length === 0) {
          router.navigate(['/auth/login']);
          return false;
        }

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
