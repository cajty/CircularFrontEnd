import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CategoryService } from '../../../core/services/category/category.service';
import { ToastService } from '../../../core/services/toast/toast.service';
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


  editCategory(category: CategoryResponse): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });


    this.focusAddForm();
  }


  confirmDelete(category: CategoryResponse): void {
    this.categoryToDelete = category;
  }


  cancelDelete(): void {
    this.categoryToDelete = null;
    this.isDeleting = false;
  }


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


  viewCategoryDetails(categoryId: number): void {
    this.isLoading = true;

    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.selectedCategory = category;


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


  closeDetails(): void {
    this.selectedCategory = null;
    this.categoryStats = null;
  }


  resetForm(): void {
    this.categoryForm.reset({ isActive: true });
    this.isEditing = false;
    this.editingCategoryId = null;
  }


  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCategories(page);
    }
  }


  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCategories(0);
  }


  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }


  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }


  applyFilters(): void {
    this.currentPage = 0; // Reset to first page
    this.loadCategories(0);
  }


  focusAddForm(): void {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      }
    }, 100);
  }


  getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {

      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {

      pages.push(0);

      if (this.currentPage > 1) {

        if (this.currentPage > 2) {
          pages.push(null);
        }


        pages.push(this.currentPage - 1);
      }


      if (this.currentPage !== 0 && this.currentPage !== this.totalPages - 1) {
        pages.push(this.currentPage);
      }

      if (this.currentPage < this.totalPages - 2) {

        pages.push(this.currentPage + 1);


        if (this.currentPage < this.totalPages - 3) {
          pages.push(null);
        }
      }

      // Always include last page
      pages.push(this.totalPages - 1);
    }

    return pages;
  }


  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };

    if (type === 'success') {
      this.toastService.success(message);
    } else {
      this.toastService.error(message);
    }


    setTimeout(() => {
      this.clearNotification();
    }, 5000);
  }


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
