import { Component, inject, effect, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LocationService } from '../../../core/services/location/location.service';
import { LocationResponse, LocationRequest, LocationType } from '../../../models/location';
import { CityListComponent } from '../../../shared/components/city-list/city-list.component';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CityListComponent,
  ],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {
  // Dependency injection
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService); // Add this line

  // Make Array constructor available for the template
  protected readonly Array = Array;

  // Signal-based state management
  locations = signal<LocationResponse[]>([]);
  loading = signal(false);
  submitting = signal(false);
  showModal = signal(false);
  editMode = signal(false);
  currentLocationId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);

  // Pagination as signals
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);
  sortField = signal('id,desc');

  // Constants
  locationTypes = Object.values(LocationType);

  // Reactive form setup
  locationForm = this.createLocationForm();

  constructor() {
    // Initialize data on component creation
    this.loadLocations();

    // Setup effects for reactive behavior
    effect(() => {
      // This effect re-runs when page, size, or sort changes
      if (this.currentPage() !== undefined || this.pageSize() !== undefined || this.sortField() !== undefined) {
        this.loadLocations();
      }
    });
  }

  // Form initialization
  private createLocationForm(): FormGroup {
    return this.fb.group({
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      cityId: [null, [Validators.required]],
      type: [LocationType.WAREHOUSE, [Validators.required]],
      isActive: [true],
      enterpriseId: [1, [Validators.required]]
    });
  }

  // Data loading methods
  private loadLocations(): void {
    this.loading.set(true);

    this.locationService.getAllLocationOfEnterprise(
      this.currentPage(),
      this.pageSize(),
      this.sortField()
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (page) => {
        this.locations.set(page.content);
        this.totalItems.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.currentPage.set(page.number);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading locations', err);
        this.toastService.error('Failed to load locations. Please try again.'); // Changed this line
        this.loading.set(false);
      }
    });
  }

  loadLocationDetails(id: number): void {
    this.loading.set(true);

    this.locationService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (location) => {
          this.patchFormWithLocation(location);
          this.editMode.set(true);
          this.currentLocationId.set(location.id);
          this.selectedCityId.set(null); // Reset city selection
          this.showModal.set(true);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading location details', err);
          this.toastService.error('Failed to load location details.'); // Changed this line
          this.loading.set(false);
        }
      });
  }

  patchFormWithLocation(location: LocationResponse): void {
    this.locationForm.patchValue({
      address: location.address,
      type: location.type,
      isActive: location.isActive,
      cityId: location.id
    });
    this.selectedCityId.set(location.id);
  }

  onCitySelected(cityId: number): void {
    this.selectedCityId.set(cityId);
    this.locationForm.patchValue({ cityId });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const locationData: LocationRequest = this.locationForm.value as LocationRequest;

    const request = this.editMode() && this.currentLocationId()
      ? this.locationService.update(this.currentLocationId()!, locationData)
      : this.locationService.create(locationData);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.toastService.success(`Location successfully ${this.editMode() ? 'updated' : 'created'}.`); // Changed this line

          if (this.editMode() && this.currentLocationId() && result) {
            // Update existing location in the list
            const currentLocations = this.locations();
            const index = currentLocations.findIndex(loc => loc.id === this.currentLocationId());

            if (index !== -1) {
              const updatedLocations = [...currentLocations];
              updatedLocations[index] = result;
              this.locations.set(updatedLocations);
            }
          } else if (result) {
            // Add new location to the list
            this.locations.update(currentLocations => [...currentLocations, result]);
          }

          this.showModal.set(false);
          this.submitting.set(false);

          if (!this.editMode()) {
            this.resetForm();
          }
        },
        error: (err) => {
          console.error('Error saving location', err);
          this.toastService.error(`Failed to ${this.editMode() ? 'update' : 'create'} location.`); // Changed this line
          this.submitting.set(false);
        }
      });
  }

  deleteLocation(id: number): void {
    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    this.loading.set(true);

    this.locationService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Location successfully deleted.'); // Changed this line

          // Remove the deleted location from the list
          this.locations.update(currentLocations =>
            currentLocations.filter(location => location.id !== id)
          );

          if (this.currentLocationId() === id) {
            this.resetForm();
          }

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error deleting location', err);
          this.toastService.error('Failed to delete location.'); // Changed this line
          this.loading.set(false);
        }
      });
  }

  // Pagination controls
  changePage(page: number): void {
    if (page !== this.currentPage()) {
      this.currentPage.set(page);
    }
  }

  changePageSize(size: number): void {
    if (size !== this.pageSize()) {
      this.pageSize.set(size);
      this.currentPage.set(0);
    }
  }

  changeSort(sortField: string): void {
    // Toggle sort direction if clicking on the same field
    if (this.sortField().split(',')[0] === sortField) {
      const currentDirection = this.sortField().split(',')[1];
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      this.sortField.set(`${sortField},${newDirection}`);
    } else {
      // Default to ascending for a new sort field
      this.sortField.set(`${sortField},asc`);
    }
  }

  // UI helper methods
  resetForm(): void {
    this.locationForm.reset({
      isActive: true,
      type: LocationType.WAREHOUSE,
      enterpriseId: 1
    });
    this.editMode.set(false);
    this.currentLocationId.set(null);
    this.selectedCityId.set(null);
  }

  newLocation(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  protected readonly HTMLSelectElement = HTMLSelectElement;
}
