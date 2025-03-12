import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category/category.service';
import { CategoryResponse } from '../../../models/materialCategory';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  @Input() selectedCategoryId: number | null = null;
  @Output() categorySelected = new EventEmitter<number>();

  categories: CategoryResponse[] = [];
  loading = true;
  error: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading = true;
    this.error = null;

    this.categoryService.getAllActiveCategories()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (err) => {
          console.error('Error fetching categories', err);
          this.error = 'Failed to load categories';
        }
      });
  }

  onCategorySelect(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.categorySelected.emit(categoryId);
  }

  isSelected(categoryId: number): boolean {
    return this.selectedCategoryId === categoryId;
  }

  retry(): void {
    this.loadCategories();
  }
}
