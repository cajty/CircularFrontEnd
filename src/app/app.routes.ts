import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: 'categories',
    loadComponent: () => import('./features/admin/category/category.component').then(m => m.CategoryComponent),
    title: 'Manage Categories'
  },
    {
        path: 'cities',
        loadComponent: () => import('./features/admin/city/city.component').then(m => m.CityComponent),
        title: 'Manage Cities'
      },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
