import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EnterpriseService } from '../../../core/services/enterprise.service';
import { EnterpriseVerificationService } from '../../../core/services/enterprise-verification.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  EnterpriseRequest,
  EnterpriseResponse,
  EnterpriseType,
  VerificationStatus
} from '../../../models/enterprise';
import {
  VerificationDocumentResponse,
  VerificationStatusUpdateRequest
} from '../../../models/enterprise-verification';

@Component({
  selector: 'app-enterprise-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './enterprise-details.component.html',
  styleUrls: ['./enterprise-details.component.css']
})
export class EnterpriseDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private enterpriseService = inject(EnterpriseService);
  private verificationService = inject(EnterpriseVerificationService);
  private toastService = inject(ToastService);


  enterpriseId!: number;
  enterprise?: EnterpriseResponse;
  verificationDocuments: VerificationDocumentResponse[] = [];


  isLoading = false;
  isSubmitting = false;
  isUploadingDocument = false;
  isUpdatingStatus = false;


  enterpriseForm!: FormGroup;
  statusUpdateRequest: VerificationStatusUpdateRequest = {
    enterpriseId: 0,
    newStatus: VerificationStatus.PENDING,
    reason: ''
  };


  enterpriseTypes = Object.values(EnterpriseType);
  verificationStatuses = Object.values(VerificationStatus);
  documentTypes = ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'OTHER'];


  selectedFile?: File;
  selectedDocumentType = this.documentTypes[0];

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.enterpriseId = +this.route.snapshot.paramMap.get('id')!;
    if (this.enterpriseId) {
      this.loadEnterpriseData();
    } else {
      this.toastService.error('Enterprise ID is required');
      this.router.navigate(['/admin/enterprises']);
    }
  }


  private initializeForm(): void {
    this.enterpriseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      registrationNumber: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z0-9]{5,15}$/)
      ]],
      enterpriseType: [EnterpriseType.RECYCLER, Validators.required]
    });
  }


  loadEnterpriseData(): void {
    this.isLoading = true;

    this.enterpriseService.getById(this.enterpriseId)
      .subscribe({
        next: (enterprise) => {
          this.enterprise = enterprise;
          this.enterpriseForm.patchValue({
            name: enterprise.name,
            registrationNumber: enterprise.registrationNumber,
            enterpriseType: enterprise.type
          });

          this.statusUpdateRequest.enterpriseId = enterprise.id;
          this.statusUpdateRequest.newStatus = enterprise.status;

          this.loadVerificationDocuments();
        },
        error: (error) => {
          this.toastService.error('Failed to load enterprise details');
          console.error('Error loading enterprise', error);
          this.isLoading = false;
        }
      });
  }


  loadVerificationDocuments(): void {
    this.verificationService.getDocuments(this.enterpriseId)
      .subscribe({
        next: (documents) => {
          this.verificationDocuments = documents;
          this.isLoading = false;
        },
        error: (error) => {
          this.toastService.error('Failed to load verification documents');
          console.error('Error loading documents', error);
          this.isLoading = false;
        }
      });
  }


  saveEnterpriseDetails(): void {
    if (this.enterpriseForm.invalid) {
      this.markFormGroupTouched(this.enterpriseForm);
      return;
    }

    this.isSubmitting = true;
    const enterpriseRequest: EnterpriseRequest = this.enterpriseForm.value;

    this.enterpriseService.update(this.enterpriseId, enterpriseRequest)
      .subscribe({
        next: (response) => {
          this.enterprise = response;
          this.toastService.success('Enterprise details updated successfully');
          this.isSubmitting = false;
        },
        error: (error) => {
          this.toastService.error('Failed to update enterprise details');
          console.error('Error updating enterprise', error);
          this.isSubmitting = false;
        }
      });
  }


  updateVerificationStatus(): void {
    this.isUpdatingStatus = true;
    this.statusUpdateRequest.enterpriseId = this.enterpriseId;

    this.verificationService.updateVerificationStatus(this.statusUpdateRequest)
      .subscribe({
        next: () => {
          this.toastService.success(`Verification status updated to ${this.statusUpdateRequest.newStatus}`);
          this.loadEnterpriseData();
          this.isUpdatingStatus = false;
        },
        error: (error) => {
          this.toastService.error('Failed to update verification status');
          console.error('Error updating status', error);
          this.isUpdatingStatus = false;
        }
      });
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }


  uploadDocument(): void {
    if (!this.selectedFile || !this.selectedDocumentType) {
      this.toastService.error('Please select a file and document type');
      return;
    }

    this.isUploadingDocument = true;

    const documentRequest = {
      enterpriseId: this.enterpriseId,
      documentType: this.selectedDocumentType,
      file: this.selectedFile
    };

    this.verificationService.uploadDocument(documentRequest)
      .subscribe({
        next: (response) => {
          this.verificationDocuments.push(response);
          this.toastService.success('Document uploaded successfully');
          this.selectedFile = undefined;
          this.isUploadingDocument = false;

          // Reset the file input
          const fileInput = document.getElementById('document-file') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (error) => {
          this.toastService.error('Failed to upload document');
          console.error('Error uploading document', error);
          this.isUploadingDocument = false;
        }
      });
  }


  getStatusClass(status: VerificationStatus): string {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'badge-green';
      case VerificationStatus.PENDING:
        return 'badge-yellow';
      case VerificationStatus.REJECTED:
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  }


  goBack(): void {
    this.router.navigate(['/admin/enterprises']);
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
