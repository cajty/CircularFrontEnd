// src/app/features/auth/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { finalize } from 'rxjs';
import {AuthService, RegisterRequest} from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
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

 onSubmit(): void {
   if (this.registerForm.invalid) {
     this.markFormGroupTouched(this.registerForm);
     return;
   }

   this.isLoading = true;
   this.errorMessage = '';
   this.successMessage = '';

   const registerRequest: RegisterRequest = {
     email: this.registerForm.value.email,
     name: this.registerForm.value.name,
     password: this.registerForm.value.password
   };

   this.authService.register(registerRequest)
     .pipe(
       finalize(() => this.isLoading = false)
     )
     .subscribe({
       next: (response) => {
         this.successMessage = 'Registration successful! You can now log in.';
         setTimeout(() => {
           this.router.navigate(['/login']);
         }, 2000);
       },
       error: (error) => {
         this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
       }
     });
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
