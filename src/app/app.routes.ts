import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth.guard';
import {CategoryListComponent} from './shared/components/category-list/category-list.component';
import {LocationListComponent} from './features/manager/location-list/location-list.component';
import {MaterialComponent} from './features/manager/material/material.component';
import {MaterialListComponent} from './features/manager/material-list/material-list.component';
import {
  EnterpriseDetailsComponent
} from './features/manager/enterprise-details/enterprise-details.component';

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
   {
    path: 'admin/enterprises',
    loadComponent: () => import('./features/admin/enterprise-list/enterprise-list.component').then(m => m.EnterpriseListComponent),
    title: 'Enterprise List',
    canActivate: [authGuard]
  },
  {
    path: 'admin/enterprises/:id',
    loadComponent: () => import('./features/admin/enterprise-details/enterprise-details.component').then(m => m.EnterpriseDetailsComponent),
    title: 'Enterprise Details',
    canActivate: [authGuard]
  },
  {
    path: 'locations',
    loadComponent: () => import('./features/manager/location/location.component').then(m => m.LocationComponent),
    title: 'Manage Locations',
    canActivate: [authGuard]
  },
   {
    path: 'materials',
    loadComponent: () => import('./features/manager/material/material.component').then(m => m.MaterialComponent),
    title: 'Manage Materials',
    canActivate: [authGuard]
  },
  {
   path: 'categoryList',
    loadComponent: () => import('./features/manager/location-list/location-list.component').then(m => m.LocationListComponent),

  },
   {
   path: 'mamagemetentroprs/:id',
    loadComponent: () => import('./features/manager/enterprise-details/enterprise-details.component').then(m => m.EnterpriseDetailsComponent),

  },
   {
    path: 'materials',
    children: [
      {
        path: 'd',
        component: MaterialListComponent,
        title: 'Materials | Circular Economy Platform',
        canActivate: [authGuard]
      },
      {
        path: 'new',
        component: MaterialComponent,
        title: 'Add New Material | Circular Economy Platform',
        canActivate: [authGuard]
      },
      {
        path: ':id',
        component: MaterialComponent,
        title: 'Material Details | Circular Economy Platform',
        canActivate: [authGuard]
      }
    ]
  },

  { path: '', redirectTo: '/Login', pathMatch: 'full' }
];
