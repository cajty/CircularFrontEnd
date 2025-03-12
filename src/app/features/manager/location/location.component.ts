import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { LocationService } from '../../../core/services/location/location.service';


import { LocationResponse, LocationRequest, LocationType } from '../../../models/location';
import {CityListComponent} from '../../../shared/components/city-list/city-list.component';

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
export class LocationComponent implements OnInit {
  // Form and state management
  locationForm: FormGroup;
  editMode = false;
  currentLocationId: number | null = null;

  // Data containers
  locations: LocationResponse[] = [];
  selectedLocation: LocationResponse | null = null;

  // UI state flags
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Selected IDs from child components
  selectedCityId: number | null = null;
  selectedCategoryId: number | null = null;

  // Location types for dropdown
  locationTypes = Object.values(LocationType);

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService
  ) {
    this.locationForm = this.createLocationForm();
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  // Form initialization
  private createLocationForm(): FormGroup {
    return this.fb.group({
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      cityId: [null, [Validators.required]],
      type: [LocationType.WAREHOUSE, [Validators.required]],
      isActive: [true],
      enterpriseId: [1, [Validators.required]] // Default value, adjust as needed
    });
  }

  // Data loading functions
  private loadLocations(): void {
    // Mock data or alternative implementation
    this.loading = true;
    this.error = null;

    // Setting loading to false since we're not making an actual API call
    this.loading = false;

    // Example of mock data
    this.locations = [
      // Add sample locations if needed for testing
      /* Example:
      {
        id: 1,
        address: '123 Main St',
        cityName: 'New York',
        type: LocationType.WAREHOUSE,
        isActive: true
      }
      */
    ];

    // Note: Replace this with actual implementation when available:
    // this.locationService.getAll().pipe(finalize(() => this.loading = false))
    //   .subscribe({
    //     next: (locations) => { this.locations = locations; },
    //     error: (err) => {
    //       console.error('Error loading locations', err);
    //       this.error = 'Failed to load locations. Please try again.';
    //     }
    //   });
  }

  loadLocationDetails(id: number): void {
    this.loading = true;
    this.error = null;

    this.locationService.getById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (location) => {
          this.selectedLocation = location;
          this.patchFormWithLocation(location);
          this.editMode = true;
          this.currentLocationId = location.id;
          this.selectedCityId = null; // We don't have cityId in the response
        },
        error: (err) => {
          console.error('Error loading location details', err);
          this.error = 'Failed to load location details.';
        }
      });
  }

  // Form handling
  patchFormWithLocation(location: LocationResponse): void {
    this.locationForm.patchValue({
      address: location.address,
      type: location.type,
      isActive: location.isActive
      // We don't have cityId or enterpriseId in the response,
      // so we keep whatever is already in the form
    });
  }

  // Event handlers from child components
  onCitySelected(cityId: number): void {
    this.selectedCityId = cityId;
    this.locationForm.patchValue({ cityId });
  }

  // CRUD operations
  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    const locationData: LocationRequest = {
      address: this.locationForm.value.address,
      cityId: this.locationForm.value.cityId,
      type: this.locationForm.value.type,
      isActive: this.locationForm.value.isActive,
      enterpriseId: this.locationForm.value.enterpriseId
    };

    const request = this.editMode && this.currentLocationId
      ? this.locationService.update(this.currentLocationId, locationData)
      : this.locationService.create(locationData);

    request.pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (result) => {
          this.successMessage = `Location successfully ${this.editMode ? 'updated' : 'created'}.`;

          // Update local array instead of reloading from service
          if (this.editMode && this.currentLocationId && result) {
            // Update existing item in array
            const index = this.locations.findIndex(loc => loc.id === this.currentLocationId);
            if (index !== -1) {
              this.locations[index] = result;
            }
          } else if (result) {
            // Add new item to array
            this.locations.push(result);
          }

          if (!this.editMode) {
            this.resetForm();
          }
        },
        error: (err) => {
          console.error('Error saving location', err);
          this.error = `Failed to ${this.editMode ? 'update' : 'create'} location.`;
        }
      });
  }

  deleteLocation(id: number): void {
    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.locationService.delete(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = 'Location successfully deleted.';

          // Remove the deleted location from the local array instead of reloading
          this.locations = this.locations.filter(location => location.id !== id);

          if (this.currentLocationId === id) {
            this.resetForm();
          }
        },
        error: (err) => {
          console.error('Error deleting location', err);
          this.error = 'Failed to delete location.';
        }
      });
  }

  // UI helpers
  resetForm(): void {
    this.locationForm.reset({
      isActive: true,
      type: LocationType.WAREHOUSE,
      enterpriseId: 1 // Default value, adjust as needed
    });
    this.editMode = false;
    this.currentLocationId = null;
    this.selectedCityId = null;
    this.selectedCategoryId = null;
    this.selectedLocation = null;
  }

  newLocation(): void {
    this.resetForm();
  }

  dismissSuccess(): void {
    this.successMessage = null;
  }

  dismissError(): void {
    this.error = null;
  }
}
