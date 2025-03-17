import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../../core/services/auth/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isDarkMode = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    // Check if user prefers dark mode
    if (localStorage.getItem('darkMode') === 'true' ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.setDarkMode(true);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
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
