import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    HeaderComponent,
    FooterComponent,

  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'recyclable-marketplace';
  isDarkMode = false;

  constructor() {}

  ngOnInit() {
    // Check if dark mode preference exists in localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.setDarkMode(savedDarkMode === 'true');
    }
  }

  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode);

    // Show toast when dark mode is toggled
    this.showToast(
      this.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled',
      'info'
    );
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

  // Toast methods
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) {
    const panelClass = [
      `toast-${type}`,
      this.isDarkMode ? 'dark-mode' : 'light-mode'
    ];


  }

  showSuccessToast(message: string, duration?: number) {
    this.showToast(message, 'success', duration);
  }

  showErrorToast(message: string, duration?: number) {
    this.showToast(message, 'error', duration);
  }

  showWarningToast(message: string, duration?: number) {
    this.showToast(message, 'warning', duration);
  }

  showInfoToast(message: string, duration?: number) {
    this.showToast(message, 'info', duration);
  }
}
