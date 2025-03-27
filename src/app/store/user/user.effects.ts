import {inject, Injectable} from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, switchMap } from 'rxjs/operators';
import * as UserActions from './user.actions';
import {AuthService} from '../../core/services/auth/auth.service';
import {Router} from "@angular/router";


@Injectable()
export class UserEffects {
  private userService = inject(AuthService);
  private actions$ = inject(Actions);
  private router = inject(Router);


  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadCurrentUser),
      mergeMap(() =>
        this.userService.getUser().pipe(
          map(user => {
            if (user) {
              return UserActions.loadCurrentUserSuccess({ user });
            } else {
              return UserActions.loadCurrentUserFailure({
                error: 'User not found or not authenticated'
              });
            }
          }),
          catchError(error => of(UserActions.loadCurrentUserFailure({ error })))
        )
      )
    )
  );


   logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logout),
      tap(() => {
        // Clear auth token
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');

        // Navigate to login page
        this.router.navigate(['/login']);


      }),
      // Dispatch an action to reset the user state to null
      map(() => UserActions.resetUserState())
    )
  );
}
