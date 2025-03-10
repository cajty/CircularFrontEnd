import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EnterpriseService } from '../../../core/services/enterprise.service';
import { ToastService } from '../../../core/services/toast.service';
import { EnterpriseResponse, EnterpriseType, VerificationStatus } from '../../../models/enterprise';

@Component({
  selector: 'app-enterprise-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './enterprise-list.component.html',
  styleUrls: ['./enterprise-list.component.css']
})
export class EnterpriseListComponent implements OnInit {

  private enterpriseService = inject(EnterpriseService);
  private toastService = inject(ToastService);
  private router = inject(Router);


  enterprises: EnterpriseResponse[] = [];


  isLoading = false;


  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;


  searchTerm = '';
  statusFilter = 'all';
  typeFilter = 'all';
  sortOrder = 'name,asc';


  enterpriseTypes = Object.values(EnterpriseType);
  verificationStatuses = Object.values(VerificationStatus);

  ngOnInit(): void {
    this.loadEnterprises();
  }

  loadEnterprises(): void {
    this.isLoading = true;

    this.enterpriseService.getAll(this.currentPage, this.pageSize, this.sortOrder)
      .subscribe({
        next: (response) => {
          this.enterprises = response.content;
          this.totalItems = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          this.toastService.error('Failed to load enterprises');
          console.error('Error loading enterprises', error);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadEnterprises();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadEnterprises();
    }
  }

  viewEnterpriseDetails(id: number): void {
    this.router.navigate(['/admin/enterprises', id]);
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
}
