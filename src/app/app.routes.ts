import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
    {
    path: 'categories',
    loadComponent: () => import('./features/admin/category/category.component').then(m => m.CategoryComponent),
    title: 'Manage Categories',
      canActivate: [authGuard]
  },
    {
        path: 'cities',
        loadComponent: () => import('./features/admin/city/city.component').then(m => m.CityComponent),
        title: 'Manage Cities',
      canActivate: [authGuard]
      },
   {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login'
      },

  { path: '', redirectTo: '/Login', pathMatch: 'full' }
];
