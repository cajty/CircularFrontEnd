import { Routes } from '@angular/router';
          import { LocationComponent } from './location/location.component';
          import { ManagerComponent } from './manager.component';

          export const managerRoutes: Routes = [
            {
              path: '',
              component: ManagerComponent,
              children: [
                {
                  path: 'locations',
                  component: LocationComponent,
                  title: 'Manage Locations'
                },
                {
                  path: 'enterprise-details',
                  loadComponent: () => import('./enterprise-details/enterprise-details.component')
                    .then(m => m.EnterpriseDetailsComponent),
                  title: 'Enterprise Details'
                },
                {
                  path: 'enterprise-form',
                  loadComponent: () => import('./enterprise-form/enterprise-form.component')
                    .then(m => m.EnterpriseFormComponent),
                  title: 'Enterprise Form'
                },
                {
                  path: 'materials',
                  children: [
                    {
                      path: '',
                      loadComponent: () => import('./material-list/material-list.component')
                        .then(m => m.MaterialListComponent),
                      title: 'Materials | Circular Economy Platform'
                    },
                     {
                      path: 'new',
                      loadComponent: () => import('./material/material.component')
                        .then(m => m.MaterialComponent),
                      title: 'Add New Material | Circular Economy Platform'
                    },
                    {
                      path: ':id',
                      loadComponent: () => import('./material/material.component')
                        .then(m => m.MaterialComponent),
                      title: 'Material Details | Circular Economy Platform'
                    }
                  ]
                }
              ]
            }
          ];
