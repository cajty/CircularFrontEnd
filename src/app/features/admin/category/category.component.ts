import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { CategoryRequest, CategoryResponse } from '../../../models/materialCategory';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface CategoryStats {
  materialCount: number;
  activeMaterials: number;
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  // Form management
  categoryForm: FormGroup;
  isEditing = false;
  editingCategoryId: number | null = null;

  // Category data
  categories: CategoryResponse[] = [];
  categoryToDelete: CategoryResponse | null = null;
  selectedCategory: CategoryResponse | null = null;
  categoryStats: CategoryStats | null = null;

  // UI state
  isLoading = false;
  isDeleting = false;
  notification: Notification | null = null;
  nameInput: ElementRef | undefined;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Filtering and Sorting
  searchTerm = '';
  statusFilter = 'all';
  sortOrder = 'name,asc';
  searchSubject = new Subject<string>();

  constructor(
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      isActive: [true]
    });

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Load categories with pagination, sorting and filtering
   */
  loadCategories(page: number = 0): void {
    this.isLoading = true;

    // Build the sort parameter
    const sort = this.sortOrder;

    // Apply status filter if necessary
    let statusFilter = '';
    if (this.statusFilter !== 'all') {
      statusFilter = this.statusFilter === 'active' ? 'true' : 'false';
    }

    this.categoryService.getAllCategories(page, this.pageSize, sort).subscribe({
      next: (data) => {
        // Apply client-side filtering for search and status if needed
        let filteredContent = data.content;

        if (this.searchTerm) {
          filteredContent = filteredContent.filter((category: CategoryResponse) =>
            category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
          );
        }

        if (statusFilter) {
          const isActive = statusFilter === 'true';
          filteredContent = filteredContent.filter((category: CategoryResponse) =>
            category.isActive === isActive
          );
        }

        this.categories = filteredContent;
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.currentPage = data.number;
        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('error', 'Failed to load categories');
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle form submission for creating or updating a category
   */
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      return;
    }

    const categoryRequest: CategoryRequest = this.categoryForm.value;
    this.isLoading = true;

    if (this.isEditing && this.editingCategoryId) {
      this.categoryService.updateCategory(this.editingCategoryId, categoryRequest).subscribe({
        next: (response) => {
          this.showNotification('success', 'Category updated successfully');
          this.resetForm();
          this.loadCategories(this.currentPage);
        },
        error: (error) => {
          this.showNotification('error', 'Failed to update category');
          this.isLoading = false;
        }
      });
    } else {
      this.categoryService.createCategory(categoryRequest).subscribe({
        next: (response) => {
          this.showNotification('success', 'Category created successfully');
          this.resetForm();
          this.loadCategories(this.currentPage);
        },
        error: (error) => {
          this.showNotification('error', 'Failed to create category');
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Set up form for editing a category
   */
  editCategory(category: CategoryResponse): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });

    // Focus the form when editing
    this.focusAddForm();
  }

  /**
   * Confirm before deleting a category
   */
  confirmDelete(category: CategoryResponse): void {
    this.categoryToDelete = category;
  }

  /**
   * Cancel the delete operation
   */
  cancelDelete(): void {
    this.categoryToDelete = null;
    this.isDeleting = false;
  }

  /**
   * Delete a category after confirmation
   */
  deleteCategory(): void {
    if (!this.categoryToDelete) return;

    this.isDeleting = true;

    this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.showNotification('success', `Category "${this.categoryToDelete?.name}" deleted successfully`);
        this.loadCategories(this.currentPage);
        this.categoryToDelete = null;
        this.isDeleting = false;
      },
      error: (error) => {
        this.showNotification('error', 'Failed to delete category. It may be in use by materials.');
        this.isDeleting = false;
      }
    });
  }

  /**
   * Toggle the active status of a category
   */
  toggleCategoryStatus(category: CategoryResponse): void {
    this.isLoading = true;

    this.categoryService.changeCategoryStatus(category.id).subscribe({
      next: () => {
        const statusText = category.isActive ? 'deactivated' : 'activated';
        this.showNotification('success', `Category "${category.name}" ${statusText} successfully`);
        this.loadCategories(this.currentPage);
      },
      error: (error) => {
        this.showNotification('error', 'Failed to update category status');
        this.isLoading = false;
      }
    });
  }

  /**
   * View category details and load statistics
   */
  viewCategoryDetails(categoryId: number): void {
    this.isLoading = true;

    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.selectedCategory = category;

        // Mock category stats since we don't have a real endpoint for this
        this.categoryStats = {
          materialCount: Math.floor(Math.random() * 50),
          activeMaterials: Math.floor(Math.random() * 30)
        };

        this.isLoading = false;
      },
      error: (error) => {
        this.showNotification('error', 'Failed to load category details');
        this.isLoading = false;
      }
    });
  }

  /**
   * Close the category details modal
   */
  closeDetails(): void {
    this.selectedCategory = null;
    this.categoryStats = null;
  }

  /**
   * Reset the form to its initial state
   */
  resetForm(): void {
    this.categoryForm.reset({ isActive: true });
    this.isEditing = false;
    this.editingCategoryId = null;
  }

  /**
   * Change page in pagination
   */
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCategories(page);
    }
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCategories(0);
  }

  /**
   * Search for categories
   */
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Clear search input
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Apply filters and sorting
   */
  applyFilters(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCategories(0);
  }

  /**
   * Focus the category name input field
   */
  focusAddForm(): void {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      }
    }, 100);
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(0);

      if (this.currentPage > 1) {
        // Add ellipsis if current page is far from first
        if (this.currentPage > 2) {
          pages.push(null); // null represents ellipsis
        }

        // Show one page before current
        pages.push(this.currentPage - 1);
      }

      // Current page
      if (this.currentPage !== 0 && this.currentPage !== this.totalPages - 1) {
        pages.push(this.currentPage);
      }

      if (this.currentPage < this.totalPages - 2) {
        // Show one page after current
        pages.push(this.currentPage + 1);

        // Add ellipsis if current page is far from last
        if (this.currentPage < this.totalPages - 3) {
          pages.push(null); // null represents ellipsis
        }
      }

      // Always include last page
      pages.push(this.totalPages - 1);
    }

    return pages;
  }

  /**
   * Show notification to user
   */
  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };

    // Also use toast service
    if (type === 'success') {
      this.toastService.success(message);
    } else {
      this.toastService.error(message);
    }

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      this.clearNotification();
    }, 5000);
  }

  /**
   * Clear notification
   */
  clearNotification(): void {
    this.notification = null;
  }


  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
