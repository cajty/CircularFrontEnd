import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError, of, take, filter} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../../../models/user';
import { Store } from '@ngrx/store';
import * as UserActions from '../../../store/user/user.actions';
import {selectCurrentUser, selectIsAuthenticated, selectUserState} from '../../../store/user/user.selectors';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private store = inject(Store);

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly AUTH_TOKEN = 'auth-token';

  // Store selectors for state access
  public storeCurrentUser$ = this.store.select(selectCurrentUser);
  public storeIsAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor() {
    // If token exists, load the user through the store
    if (this.isLoggedIn()) {
      this.store.dispatch(UserActions.loadCurrentUser());
    }
  }

  register(registerRequest: RegisterRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/signup`, registerRequest)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.AUTH_TOKEN, response.token);
            this.toastService.success('Registration successful');

            // Dispatch action to load user into store
            this.store.dispatch(UserActions.loadCurrentUser());
          }
        }),
        map(response => !!response.token),
        catchError(error => {
          this.toastService.error('Registration failed: Invalid data');
          return throwError(() => error);
        })
      );
  }

  getUser(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/currentUser`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  login(loginRequest: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.AUTH_TOKEN, response.token);
            this.toastService.success('Login successful');

            this.store.dispatch(UserActions.loadCurrentUser());
          }
        }),
        map(response => !!response.token),
        catchError(error => {
          this.toastService.error('Login failed: Invalid credentials');
          return throwError(() => error);
        })
      );
  }

// First, create a role-routes mapping
private readonly roleRouteMap: Record<string, string> = {
  'ADMIN': '/admin/categories',
  'MANAGER': '/user/enterprise-details',
  'USER': '/user/enterprise-details'
};

// Default route if no match is found
private readonly defaultRoute: string = 'user/enterprise-details';

getRouteBasedOnRole(): Observable<string> {

  this.store.dispatch(UserActions.loadCurrentUser());


  return this.store.select(selectUserState).pipe(
    // Wait until loading is false (meaning the loadCurrentUser effect has completed)
    filter(state => !state.loading),
    // Take only the first emission after loading completes
    take(1),
    // Switch to the user data
    switchMap(() => this.storeCurrentUser$.pipe(take(1))),
    // Determine the route based on user roles
    map(user => {
      if (!user?.roles?.length) {
        return this.defaultRoute;
      }


      for (const role of user.roles) {
        const route = this.roleRouteMap[role];
        if (route) {
          return route;
        }
      }

      // If no matching routes found, return default
      return this.defaultRoute;
    }),
    catchError(() => {
      return of(this.defaultRoute);
    })
  );
}

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.AUTH_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN);
  }
}
