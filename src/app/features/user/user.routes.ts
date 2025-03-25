import { Routes } from '@angular/router';
import {UserComponent} from './user.component';

          export const userRoutes: Routes = [
            {
              path: '',
              component: UserComponent,
              children: [
                {
                  path: 'enterprise-details',
                  loadComponent: () => import('../user/enterprise-details/enterprise-details.component')
                    .then(m => m.EnterpriseDetailsComponent),
                  title: 'Enterprise Details'
                },
                {
                  path: 'enterprise-form',
                  loadComponent: () => import('../user/enterprise-form/enterprise-form.component')
                    .then(m => m.EnterpriseFormComponent),
                  title: 'Enterprise Form'
                },
              ]
            }
          ];
