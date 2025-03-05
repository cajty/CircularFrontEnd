import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: 'categories',
    loadComponent: () => import('./features/admin/category/category.component').then(m => m.CategoryComponent),
  },
    {
        path: 'cities',
        loadComponent: () => import('./features/admin/city/city-list.component')
          .then(m => m.CityListComponent),
        title: 'Manage Cities'
      },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
