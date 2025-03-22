// src/app/core/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth-token');

  // Check if the route is already an auth route to prevent redirect loops
  const isAuthRoute = state.url.includes('/auth/') ||
                      state.url.includes('/login') ||
                      state.url.includes('/register');

  if (token) {
    // User is logged in
    if (isAuthRoute) {
      // If trying to access login page while logged in, redirect to appropriate page
      // You can customize this redirect based on user role if needed
      return router.createUrlTree(['/dashboard']);
    }
    return true;
  } else {
    // User is not logged in
    if (isAuthRoute) {
      // Allow access to auth routes when not logged in
      return true;
    }

    // Store the URL the user was trying to access
    localStorage.setItem('redirectUrl', state.url);

    // Redirect to login
    return router.createUrlTree(['/auth/login']);
  }
};
