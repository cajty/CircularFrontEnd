import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser, selectIsAuthenticated } from '../../../store/user/user.selectors';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../models/user';
import * as UserActions from '../../../store/user/user.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isDarkMode = false;


  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  // For storing current values
  isAuthenticated = false;
  currentUser: User | null = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);

  constructor() {
    // Initialize observables
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    // Check if user prefers dark mode
    if (localStorage.getItem('darkMode') === 'true' ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.setDarkMode(true);
    }

    // Subscribe to authentication state
    this.subscriptions.push(
      this.isAuthenticated$.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      })
    );

    // Subscribe to current user
    this.subscriptions.push(
      this.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    // Dispatch logout action directly to the store instead of going through the service
    this.store.dispatch(UserActions.logout());
    this.isMenuOpen = false;
  }

  isLoggedIn() {
    // Use the stored value from the store subscription
    return this.isAuthenticated;
  }

  getCurrentUserInitial(): string {
    if (this.currentUser && this.currentUser.firstName) {
      return this.currentUser.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  }

  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode);
  }

  setDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save preference to localStorage
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }
}
