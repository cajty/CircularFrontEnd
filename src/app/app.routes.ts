import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes - public access
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register/register.component').then(m => m.RegisterComponent),
        title: 'Register'
      }
    ]
  },

  // Admin section
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
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
      {
        path: 'enterprises',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/enterprise-list/enterprise-list.component')
              .then(m => m.EnterpriseListComponent),
            title: 'Enterprise List'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/admin/enterprise-details/enterprise-details.component')
              .then(m => m.EnterpriseDetailsComponent),
            title: 'Enterprise Details'
          }
        ]
      }
    ]
  },

  // Manager section
  {
    path: 'manager',
    canActivate: [authGuard],
    children: [
      {
        path: 'locations',
        loadComponent: () => import('./features/manager/location/location.component')
          .then(m => m.LocationComponent),
        title: 'Manage Locations'
      },
      {
        path: 'enterprise-details',
        loadComponent: () => import('./features/manager/enterprise-details/enterprise-details.component')
          .then(m => m.EnterpriseDetailsComponent),
        title: 'Enterprise Details'
      },
      {
        path: 'enterprise-form',
        loadComponent: () => import('./features/manager/enterprise-form/enterprise-form.component')
          .then(m => m.EnterpriseFormComponent),
        title: 'Enterprise Form'
      },
      {
        path: 'materials',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/manager/material-list/material-list.component')
              .then(m => m.MaterialListComponent),
            title: 'Materials | Circular Economy Platform'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/manager/material/material.component')
              .then(m => m.MaterialComponent),
            title: 'Add New Material | Circular Economy Platform'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/manager/material/material.component')
              .then(m => m.MaterialComponent),
            title: 'Material Details | Circular Economy Platform'
          }
        ]
      }
    ]
  },

  // Redirect for common routes to maintain backward compatibility
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
  { path: 'categories', redirectTo: '/admin/categories', pathMatch: 'full' },
  { path: 'cities', redirectTo: '/admin/cities', pathMatch: 'full' },
  { path: 'locations', redirectTo: '/manager/locations', pathMatch: 'full' },
  { path: 'materials', redirectTo: '/manager/materials', pathMatch: 'full' },

  // Catch-all route for 404
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent), title: 'Page Not Found' }
];
