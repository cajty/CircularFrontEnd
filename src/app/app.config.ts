import { ApplicationConfig, APP_INITIALIZER, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInitializerService } from './core/services/auth/auth-initializer.service';

import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userReducer } from './store/user/user.reducer';
import { UserEffects } from './store/user/user.effects';
import {provideStore} from '@ngrx/store';

export const appConfig: ApplicationConfig = {
  providers: [

    {
      provide: APP_INITIALIZER,
      useFactory: (authInit: AuthInitializerService) => () => authInit.initializeAuth(),
      deps: [AuthInitializerService],
      multi: true
    },

    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideAnimations(),
    provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),

    provideStore({
      user: userReducer
    }),
    provideEffects([UserEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true
    })
  ],
};
