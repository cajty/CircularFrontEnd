// src/app/core/services/auth/auth-initializer.service.ts
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as UserActions from '../../../store/user/user.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthInitializerService {
  private store = inject(Store);


  initializeAuth(): Promise<boolean> {
    return new Promise((resolve) => {

      const token = localStorage.getItem('auth-token');

      if (token) {
        this.store.dispatch(UserActions.loadCurrentUser());
      }

      resolve(true);
    });
  }
}
