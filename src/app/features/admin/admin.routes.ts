import { Routes } from '@angular/router';
  import { AdminComponent } from './admin.component';

  export const adminRoutes: Routes = [
    {
      path: '',
      component: AdminComponent,
      children: [
        {
          path: 'categories',
          loadComponent: () => import('./category/category.component').then(m => m.CategoryComponent),
          title: 'Manage Categories'
        },
        {
          path: 'cities',
          loadComponent: () => import('./city/city.component').then(m => m.CityComponent),
          title: 'Manage Cities'
        },
        {
          path: 'enterprises',
          children: [
            {
              path: '',
              loadComponent: () => import('./enterprise-list/enterprise-list.component')
                .then(m => m.EnterpriseListComponent),
              title: 'Enterprise List'
            },
            {
              path: ':id',
              loadComponent: () => import('./enterprise-details/enterprise-details.component')
                .then(m => m.EnterpriseDetailsComponent),
              title: 'Enterprise Details'
            }
          ]
        }
      ]
    }
  ];
