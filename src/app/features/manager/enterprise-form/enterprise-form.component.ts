import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { EnterpriseService } from '../../../core/services/enterprise/enterprise.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import {
  EnterpriseRequest,
  EnterpriseType
} from '../../../models/enterprise';

@Component({
  selector: 'app-enterprise-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './enterprise-form.component.html',
  styleUrl: './enterprise-form.component.css'
})
export class EnterpriseFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private enterpriseService = inject(EnterpriseService);
  private toastService = inject(ToastService);
  private router = inject(Router);


  enterpriseForm: FormGroup;


  enterpriseTypes = Object.values(EnterpriseType);


  enterpriseTypeIcons: { [key in EnterpriseType]: string } = {
    [EnterpriseType.RECYCLER]: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    `,
    [EnterpriseType.COLLECTOR]: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    `,
    [EnterpriseType.PROCESSOR]: `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    `
  };

  constructor() {
    this.enterpriseForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      registrationNumber: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z0-9]{5,15}$/)
      ]],
      enterpriseType: [null, Validators.required]
    });
  }

  ngOnInit(): void {


  }

  // Form submission method
  onSubmit(): void {
    if (this.enterpriseForm.invalid) {
      this.markFormGroupTouched(this.enterpriseForm);
      return;
    }

    const enterpriseRequest: EnterpriseRequest = this.enterpriseForm.value;


    this.enterpriseService.create(enterpriseRequest)
      .subscribe({
        next: (response) => {
          this.toastService.success('Enterprise registered successfully');
          setTimeout(()=>
              this.router.navigate(['/manager/enterprise-details']),
           2000 )

        },
        error: (error) => {
          this.toastService.error('Failed to register enterprise');
          console.error('Enterprise registration error', error);
        }
      });
  }

  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get formControls() {
    return this.enterpriseForm.controls;
  }
}
