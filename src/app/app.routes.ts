import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { authRoutes } from "./features/auth/auth.routes";
import { adminRoutes } from "./features/admin/admin.routes";
import { managerRoutes } from './features/manager/manager.routes';
import { userRoutes } from './features/user/user.routes';
import { roleGuard } from './core/guards/role.guard';


export const routes: Routes = [

  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },


  {
    path: 'auth',
    children: authRoutes,
  },


  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    children: adminRoutes
  },


  {
    path: 'manager',
    canActivate: [authGuard, roleGuard(['MANAGER'])],
    children: managerRoutes
  },

   {
    path: 'user',
    canActivate: [authGuard, roleGuard(['MANAGER', 'USER'])],
    children: userRoutes
  },



  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
  { path: 'categories', redirectTo: '/admin/categories', pathMatch: 'full' },
  { path: 'cities', redirectTo: '/admin/cities', pathMatch: 'full' },
  { path: 'locations', redirectTo: '/manager/locations', pathMatch: 'full' },
  { path: 'materials', redirectTo: '/manager/materials', pathMatch: 'full' },

  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  }
];
