import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import {AuthService} from '../../../core/services/auth/auth.service';
import {User} from '../../../models/user';
import {ToastService} from '../../../core/services/toast/toast.service';
import {selectCurrentUser} from '../../../store/user/user.selectors';



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // User data
  currentUser: User | null = null;

  // UI state management with signals
  isLoading = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  isMobile = signal<boolean>(this.checkIfMobile());

  // Subscriptions for cleanup
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.loadUserData();

    // Listen for device orientation changes
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  // Check if we're on a mobile device
  private checkIfMobile(): boolean {
    return window.innerWidth < 640;
  }

  // Handle resize events to update mobile status
  private onResize(): void {
    this.isMobile.set(this.checkIfMobile());
  }

  // Listen for back button on mobile
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    // If delete confirmation is showing, hide it and prevent navigation
    if (this.showDeleteConfirm()) {
      event.preventDefault();
      this.showDeleteConfirm.set(false);
      history.pushState(null, '', window.location.href);
    }
  }

  loadUserData(): void {
    this.isLoading.set(true);

    const userSub = this.store.select(selectCurrentUser).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user data', err);
        this.toastService.error('Failed to load profile data');
        this.isLoading.set(false);
      }
    });

    this.subscriptions.add(userSub);
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);

    // On mobile, add an entry to history so back button can dismiss modal
    if (this.isMobile()) {
      history.pushState(null, '', window.location.href);
    }

    // Provide haptic feedback on mobile (if available)
    if (this.isMobile() && window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(100);
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteAccount(): void {
    this.isLoading.set(true);

    // This would typically call a service to delete the user account
    // For now, we'll simulate a successful deletion
    setTimeout(() => {
      // Process logout and redirect
      this.toastService.success('Your account has been deleted');

      // Provide longer haptic feedback for significant action on mobile
      if (this.isMobile() && window.navigator && 'vibrate' in window.navigator) {
        window.navigator.vibrate([100, 50, 200]);
      }

      // this.store.dispatch(UserActions.logout());
      this.router.navigate(['/auth/login']);
    }, 800);
  }

  // go back to that dashboard
  goBack(): void {
      this.authService.getRouteBasedOnRole().subscribe(routePath => {
              this.router.navigate([routePath]);
          });
  }
}
