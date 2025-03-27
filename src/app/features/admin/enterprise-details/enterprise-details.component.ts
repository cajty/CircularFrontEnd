import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { EnterpriseService } from '../../../core/services/enterprise/enterprise.service';
import { EnterpriseVerificationService } from '../../../core/services/enterprise-verification/enterprise-verification.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import {
  EnterpriseResponse,
  EnterpriseType,
  VerificationStatus
} from '../../../models/enterprise';
import {
  VerificationDocumentResponse,
  VerificationStatusUpdateRequest
} from '../../../models/enterprise-verification';
import {DocumentViewerComponent} from '../../../shared/components/document-viewer/document-viewer.component';

@Component({
  selector: 'app-enterprise-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, DocumentViewerComponent],
  templateUrl: './enterprise-details.component.html',
  styleUrls: ['./enterprise-details.component.css']
})
export class EnterpriseDetailsComponent implements OnInit, OnDestroy {
  // Cleanup subject
  private destroy$ = new Subject<void>();

  // Enterprise data
  enterpriseId!: number;
  enterprise!: EnterpriseResponse;
  verificationDocuments: VerificationDocumentResponse[] = [];

  // UI state
  isLoading = false;
  isUpdatingStatus = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Form declarations
  enterpriseForm!: FormGroup;
  statusUpdateRequest: VerificationStatusUpdateRequest = {
    enterpriseId: 0,
    newStatus: VerificationStatus.PENDING,
    reason: ''
  };
  creatDocLink : string  = "";
  showDocumentViewer = false;

  closeDocumentViewer() {
    this.showDocumentViewer = false;
  }

  showDocument(docLink : string): void {
   this.creatDocLink = docLink;
    this.showDocumentViewer = true;
  }

  // Constants and lookups
  enterpriseTypes = Object.values(EnterpriseType);
  verificationStatuses = Object.values(VerificationStatus);
  documentTypes = ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'ID_PROOF', 'ADDRESS_PROOF', 'OTHER'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private enterpriseService: EnterpriseService,
    private verificationService: EnterpriseVerificationService,
    private toastService: ToastService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get ID from route params
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.enterpriseId = +idParam;
      this.loadEnterpriseData();
    } else {
      this.toastService.error('Enterprise ID is required');
      this.router.navigate(['/admin/enterprises']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.errorMessage = null;

    this.enterpriseService.getById(this.enterpriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Update enterprise data
          this.enterprise = data;

          // Pre-populate form
          this.enterpriseForm.patchValue({
            name: data.name,
            registrationNumber: data.registrationNumber,
            enterpriseType: data.type
          });

          // Setup status update request
          this.statusUpdateRequest.enterpriseId = data.id;
          this.statusUpdateRequest.newStatus = data.status;

          // Load documents next
          this.loadVerificationDocuments();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load enterprise details';
          this.toastService.error('Failed to load enterprise details');
          console.error('Error loading enterprise', error);
          this.isLoading = false;
        }
      });
  }

  loadVerificationDocuments(): void {
    this.verificationService.getDocuments(this.enterpriseId)
      .pipe(takeUntil(this.destroy$))
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

  updateVerificationStatus(): void {
    if (!this.statusUpdateRequest.reason) {
      this.toastService.error('Please provide a reason for the status change');
      return;
    }

    this.isUpdatingStatus = true;
    this.errorMessage = null;

    // Ensure enterprise ID is set correctly
    this.statusUpdateRequest.enterpriseId = this.enterpriseId;

    this.enterpriseService.updateVerificationStatus(this.statusUpdateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(`Verification status updated to ${this.statusUpdateRequest.newStatus}`);
          this.successMessage = `Status successfully updated to ${this.statusUpdateRequest.newStatus}`;
          this.loadEnterpriseData();
          this.isUpdatingStatus = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to update verification status';
          this.toastService.error('Failed to update verification status');
          console.error('Error updating status', error);
          this.isUpdatingStatus = false;
        }
      });
  }

  /**
   * Returns the appropriate CSS class for a verification status
   */
  getStatusClass(status: VerificationStatus): string {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'badge-green';
      case VerificationStatus.PENDING:
        return 'badge-yellow';
      case VerificationStatus.REJECTED:
        return 'badge-red';
      case VerificationStatus.UNDER_REVIEW:
        return 'badge-blue';
      default:
        return 'badge-gray';
    }
  }

  /**
   * Navigate back to the enterprises list
   */
  goBack(): void {
    this.router.navigate(['/admin/enterprises']);
  }
}
