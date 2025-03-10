// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';


export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;

}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly AUTH_TOKEN = 'auth-token';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  register(registerRequest: RegisterRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/signup`, registerRequest)
      .pipe(
        catchError(error => {
          this.toastService.error('Registration failed');
          return throwError(() => error);
        })
      );
  }

  login(loginRequest: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.token) {
            // Save token in localStorage
            localStorage.setItem(this.AUTH_TOKEN, response.token);

            // Parse JWT token to get user info
            const user = this.parseJwt(response.token);

            // Update auth status
            this.updateAuthStatus(user);

            this.toastService.success('Login successful');
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
    localStorage.removeItem('auth-token');


    // Reset auth status
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Navigate to login page
    this.router.navigate(['/login']);
    this.toastService.info('You have been logged out');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.AUTH_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }


  private parseJwt(token: string): AuthUser {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
        this.toastService.info(payload);

      return {
        id: payload.id || payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role
      };
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return { email: '' };
    }
  }

  // Load user from localStorage (called in constructor)
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const user = this.parseJwt(token);
        this.updateAuthStatus(user);
      } catch (e) {
        console.error('Error loading user from storage', e);
        this.logout();
      }
    }
  }

  // Update authentication status
  private updateAuthStatus(user: AuthUser): void {
    if (user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);

    }
  }
}
