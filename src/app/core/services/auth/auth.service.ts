import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../../../models/user';
import { Store } from '@ngrx/store';
import * as UserActions from '../../../store/user/user.actions';
import { selectCurrentUser, selectIsAuthenticated } from '../../../store/user/user.selectors';

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

  // We'll keep these subjects for backward compatibility
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Store selectors for state access
  public storeCurrentUser$ = this.store.select(selectCurrentUser);
  public storeIsAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor() {
    // Initialize authentication state based on token presence
    this.isAuthenticatedSubject.next(this.isLoggedIn());

    // Subscribe to store changes to keep BehaviorSubjects in sync
    this.storeCurrentUser$.subscribe(user => {
      this.currentUserSubject.next(user);
    });

    this.storeIsAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticatedSubject.next(isAuthenticated);
    });

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
            this.isAuthenticatedSubject.next(true);
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
            this.isAuthenticatedSubject.next(true);
            this.toastService.success('Login successful');

            // Dispatch action to load user into store
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

  logout(): void {
    // Dispatch logout action to the store
    this.store.dispatch(UserActions.logout());

    // The rest is handled by the effect, but we'll keep this for backward compatibility
    localStorage.removeItem(this.AUTH_TOKEN);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
    this.toastService.info('You have been logged out');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.AUTH_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
