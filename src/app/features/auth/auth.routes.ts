import { Routes } from '@angular/router';
    import { AuthComponent } from './auth.component';

    export const authRoutes: Routes = [
      {
        path: '',
        component: AuthComponent,
        children: [
          {
            path: 'login',
            loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
            title: 'Login'
          },
          {
            path: 'register',
            loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
            title: 'Register'
          }
        ]
      }
    ];
