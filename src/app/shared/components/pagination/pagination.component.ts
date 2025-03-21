// src/app/shared/components/pagination/pagination.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() totalPages: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() showPageSizeSelector: boolean = true;
  @Input() showPageInfo: boolean = true;
  @Input() maxPagesToShow: number = 5;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pages: (number | null)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPage'] || changes['maxPagesToShow']) {
      this.calculateVisiblePages();
    }
  }

  calculateVisiblePages(): void {
    const pages: (number | null)[] = [];

    if (this.totalPages <= this.maxPagesToShow) {
      // If total pages is less than max pages to show, display all pages
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(0);

      // Calculate start and end of visible page range around current page
      let startPage = Math.max(1, this.currentPage - Math.floor((this.maxPagesToShow - 3) / 2));
      let endPage = Math.min(this.totalPages - 2, startPage + this.maxPagesToShow - 4);

      // Adjust start if end is too close to total pages
      if (endPage === this.totalPages - 2) {
        startPage = Math.max(1, endPage - (this.maxPagesToShow - 4));
      }

      // Add ellipsis if needed after first page
      if (startPage > 1) {
        pages.push(null);
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed before last page
      if (endPage < this.totalPages - 2) {
        pages.push(null);
      }

      // Always include last page
      if (this.totalPages > 1) {
        pages.push(this.totalPages - 1);
      }
    }

    this.pages = pages;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  changePageSize(event: Event): void {
    const size = +(event.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(size);
  }

  goToFirstPage(): void {
    this.changePage(0);
  }

  goToPreviousPage(): void {
    this.changePage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.changePage(this.currentPage + 1);
  }

  goToLastPage(): void {
    this.changePage(this.totalPages - 1);
  }
}
