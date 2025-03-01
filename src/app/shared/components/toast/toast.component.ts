// toast.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed, HostBinding, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => visible', animate('200ms ease-out')),
      transition('visible => void', animate('150ms ease-in')),
    ])
  ],
  template: `
    <div
      [@toastAnimation]="visible() ? 'visible' : 'void'"
      [class]="toastClasses()"
      role="alert"
      aria-live="assertive"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          @if (type() === 'success') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          }
          <!-- Error Icon -->
          @if (type() === 'error') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          }
          <!-- Warning Icon -->
          @if (type() === 'warning') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          }
          <!-- Info Icon -->
          @if (type() === 'info') {
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          }
        </div>
        <div class="ml-3">
          @if (title()) {
            <h3 class="text-sm font-medium">{{ title() }}</h3>
          }
          <div class="text-sm">{{ message() }}</div>
        </div>
        <div class="ml-auto pl-3">
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-primary"
            (click)="onClose()"
            aria-label="Close"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      max-width: 24rem;
      z-index: 50;
    }
  `]
})
export class ToastComponent implements OnInit {
  // Input signals
  type = signal<ToastType>('info');
  title = signal<string>('');
  message = signal<string>('');
  duration = signal<number>(5000); // Default duration in ms
  visible = signal<boolean>(false);

  // Output event
  @Output() closed = new EventEmitter<void>();

  // Computed styles based on type
  toastClasses = computed(() => {
    const baseClasses = 'p-4 rounded-md shadow-lg border transition-all duration-300 ease-in-out flex items-start';

    switch (this.type()) {
      case 'success':
        return `${baseClasses} bg-primary bg-opacity-10 text-primary border-primary`;
      case 'error':
        return `${baseClasses} bg-error bg-opacity-10 text-error border-error`;
      case 'warning':
        return `${baseClasses} bg-warning bg-opacity-10 text-warning border-warning`;
      case 'info':
        return `${baseClasses} bg-info bg-opacity-10 text-info border-info`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-dark-surface dark:text-dark-text dark:border-dark-border`;
    }
  });

  private timeoutId: any = null;

  ngOnInit(): void {
    this.visible.set(true);
    this.setupAutoDismiss();
  }

  // For programmatic type setting
  setType(type: ToastType): void {
    this.type.set(type);
  }

  // For programmatic message setting
  setMessage(message: string): void {
    this.message.set(message);
  }

  // For programmatic title setting
  setTitle(title: string): void {
    this.title.set(title);
  }

  // For programmatic show
  show(message: string, type: ToastType = 'info', title: string = '', duration: number = 5000): void {
    this.message.set(message);
    this.type.set(type);
    this.title.set(title);
    this.duration.set(duration);
    this.visible.set(true);

    this.setupAutoDismiss();
  }

  // Close the toast
  onClose(): void {
    this.visible.set(false);
    this.clearTimeout();
    setTimeout(() => {
      this.closed.emit();
    }, 150); // Match animation duration
  }

  // Auto dismiss after duration
  private setupAutoDismiss(): void {
    this.clearTimeout();
    if (this.duration() > 0) {
      this.timeoutId = setTimeout(() => {
        this.onClose();
      }, this.duration());
    }
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
