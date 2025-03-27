import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { finalize, debounceTime, Subject, takeUntil } from 'rxjs';
import { MaterialResponse, MaterialSearchFilters, MaterialStatus, MaterialUnit } from '../../../models/material';
import { Page } from '../../../models/page';
import { MaterialService } from '../../../core/services/material/materail.service';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './material-list.component.html',
  styleUrl: './material-list.component.css'
})
export class MaterialListComponent implements OnInit, OnDestroy {
  materials: MaterialResponse[] = [];
  page: Page<MaterialResponse> | null = null;
  loading = true;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10; // Increased page size for better usability
  sortField = 'listedAt';
  sortDirection = 'desc';

  // Search form
  searchForm!: FormGroup;
  materialStatusOptions = Object.values(MaterialStatus);

  // For cleanup
  private destroy$ = new Subject<void>();

  private materialService = inject(MaterialService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initSearchForm();
    this.loadMaterials();


    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0; // Reset to first page on filter change
        this.loadMaterials();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      minPrice: [null],
      maxPrice: [null],
      status: [null]
    });
  }

  private loadMaterials(): void {
    this.loading = true;
    this.error = null;


    const formValues = this.searchForm.value;
    const filters: MaterialSearchFilters = {
      name: formValues.name || undefined,
      minPrice: formValues.minPrice || undefined,
      maxPrice: formValues.maxPrice || undefined,
      status: formValues.status || undefined
    };

    const sort = `${this.sortField},${this.sortDirection}`;

    this.materialService.searchMaterials(filters, this.currentPage, this.pageSize, sort)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (page) => {
          this.page = page;
          this.materials = page.content;
        },
        error: (err) => {
          console.error('Error loading materials', err);
          this.error = 'Failed to load materials. Please try again later.';
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadMaterials();
  }

  onSortChange(field: string): void {
    // If clicking on the same field, toggle direction
    if (field === this.sortField) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.loadMaterials();
  }

  clearFilters(): void {
    this.searchForm.reset({
      name: '',
      minPrice: null,
      maxPrice: null,
      status: null
    });
    // Form valueChanges will trigger the search
  }

  viewMaterial(id: number): void {
    this.router.navigate(['manager/materials', id]);
  }

  createMaterial(): void {
    this.router.navigate(['manager/materials/new']);
  }

  retry(): void {
    this.loadMaterials();
  }

  // Format enum values for display
  formatEnumValue(value: string): string {
    if (!value) return '';

    return value.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  calculatePageNumbers(): number[] {
    if (!this.page) return [];

    const totalPages = this.page.totalPages;

    // If total pages <= 5, show all pages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // Always include current page, 2 pages before and 2 pages after (if they exist)
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(totalPages - 1, this.currentPage + 2);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}
