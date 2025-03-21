// src/app/features/auth/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import {RegisterRequest} from '../../../models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Password pattern: at least one uppercase, one lowercase, one number, min 8 chars
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // Available country codes for the dropdown
  countryOptions = [
 {name: 'Morocco', dialCode: '+212'},
    {  name: 'Cambodia', dialCode: '+855' },
    {  name: 'United States', dialCode: '+1' },
    {  name: 'Thailand', dialCode: '+66' },
    { name: 'Vietnam', dialCode: '+84' },
    { name: 'Singapore', dialCode: '+65' },
    {  name: 'Malaysia', dialCode: '+60' },
    {  name: 'Indonesia', dialCode: '+62' },
    {  name: 'Philippines', dialCode: '+63' }
  ];

  // Default selected country (Cambodia)
  selectedCountry = this.countryOptions[0];

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      countryCode: [this.selectedCountry.dialCode],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordPattern)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Custom validator to check if password and confirmPassword match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onCountryChange(event: any): void {
    const selectedCode = event.target.value;
    this.selectedCountry = this.countryOptions.find(c => c.dialCode === selectedCode) || this.countryOptions[0];
    this.registerForm.patchValue({
      countryCode: this.selectedCountry.dialCode
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Normalize phone number to E.164 format
    const countryCode = this.registerForm.value.countryCode;
    const phoneNumber = this.registerForm.value.phoneNumber;
    const e164PhoneNumber = this.formatToE164(countryCode, phoneNumber);

    const registerRequest: RegisterRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      phoneNumber: e164PhoneNumber,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(registerRequest)
       .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (success) => {
          if(success){
              this.successMessage = 'Registration successful! You can now log in.';
          setTimeout(() => {
            this.router.navigate(['/manager/enterprise-details']);
          }, 200);
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Invalid email or password';
        }
      });
  }


  private formatToE164(countryCode: string, phoneNumber: string): string {
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If phone starts with 0, remove it
    const normalizedPhone = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly;

    // Make sure country code doesn't have + prefix when concatenating
    const normalizedCountryCode = countryCode.startsWith('+') ?
      countryCode : `+${countryCode}`;

    return `${normalizedCountryCode}${normalizedPhone}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
