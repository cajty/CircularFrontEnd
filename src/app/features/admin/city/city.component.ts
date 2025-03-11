import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {CityService} from '../../../core/services/city/city.service';
import {ToastService} from '../../../core/services/toast/toast.service';
import {CityRequest, CityResponse} from '../../../models/city';


@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit, OnDestroy {
  // Services
  private fb = inject(FormBuilder);
  private cityService = inject(CityService);
  private toastService = inject(ToastService);

  // Signals for reactive state management
  private editingCityId = signal<number | null>(null);
  private cityToDeleteId = signal<number | null>(null);
  cities = signal<CityResponse[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showForm = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  searchTerm = signal<string>('');
  sortField = signal<string>('name');
  sortDirection = signal<string>('asc');

  // Computed values based on signals
  isEditing = computed(() => this.editingCityId() !== null);
  filteredCities = computed(() => {
    let filtered = this.cities();

    // Apply search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(city =>
        city.name.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const fieldA = a[this.sortField() as keyof CityResponse];
      const fieldB = b[this.sortField() as keyof CityResponse];

      if (fieldA < fieldB) return this.sortDirection() === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Form setup
  cityForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\s.\-']+$/)
    ]],
    isActive: [true]
  });

  // For cleanup
  private subscriptions = new Subscription();

  get formControls() {
    return this.cityForm.controls;
  }

  ngOnInit(): void {
    this.loadCities();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCities(): void {
    this.isLoading.set(true);

    const subscription = this.cityService.getAll().subscribe({
      next: (data) => {
        // Convert Set to Array if needed
        this.cities.set(Array.from(data));
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load cities');
        console.error('Error loading cities', error);
        this.isLoading.set(false);
      }
    });

    this.subscriptions.add(subscription);
  }

  onSubmit(): void {
    if (this.cityForm.invalid) return;

    const cityData: CityRequest = this.cityForm.value;
    this.isSubmitting.set(true);

    if (this.isEditing()) {
      // Update existing city
      const subscription = this.cityService.update(this.editingCityId()!, cityData).subscribe({
        next: (updatedCity) => {
          // Update the cities array with new data
          this.cities.update(cities => {
            const index = cities.findIndex(c => c.id === updatedCity.id);
            if (index !== -1) {
              cities[index] = updatedCity;
            }
            return [...cities];
          });

          this.toastService.success(`City "${updatedCity.name}" updated successfully`);
          this.resetForm();
        },
        error: (error) => {
          this.toastService.error('Failed to update city');
          console.error('Error updating city', error);
          this.isSubmitting.set(false);
        }
      });

      this.subscriptions.add(subscription);
    } else {
      // Create new city
      const subscription = this.cityService.create(cityData).subscribe({
        next: (newCity) => {
          this.cities.update(cities => [...cities, newCity]);
          this.toastService.success(`City "${newCity.name}" created successfully`);
          this.resetForm();
        },
        error: (error) => {
          this.toastService.error('Failed to create city');
          console.error('Error creating city', error);
          this.isSubmitting.set(false);
        }
      });

      this.subscriptions.add(subscription);
    }
  }

  editCity(city: CityResponse): void {
    this.editingCityId.set(city.id);
    this.cityForm.patchValue({
      name: city.name,
      isActive: city.isActive
    });
    this.showForm.set(true);

    // Scroll to form
    document.getElementById('cityForm')?.scrollIntoView({ behavior: 'smooth' });
  }

  confirmDelete(id: number): void {
    this.cityToDeleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  deleteCity(): void {
    if (!this.cityToDeleteId()) return;

    this.isLoading.set(true);

    const subscription = this.cityService.delete(this.cityToDeleteId()!).subscribe({
      next: () => {
        this.cities.update(cities => cities.filter(c => c.id !== this.cityToDeleteId()));
        this.toastService.success('City deleted successfully');
        this.cancelDelete();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to delete city');
        console.error('Error deleting city', error);
        this.isLoading.set(false);
      }
    });

    this.subscriptions.add(subscription);
  }

  cancelDelete(): void {
    this.cityToDeleteId.set(null);
    this.showDeleteConfirm.set(false);
  }

  toggleStatus(id: number, event: Event): void {
    event.stopPropagation();
    this.isLoading.set(true);

    const subscription = this.cityService.changeStatus(id).subscribe({
      next: () => {
        // Update the status in the cities array
        this.cities.update(cities => {
          return cities.map(city => {
            if (city.id === id) {
              return { ...city, isActive: !city.isActive };
            }
            return city;
          });
        });

        const city = this.cities().find(c => c.id === id);
        const status = city?.isActive ? 'activated' : 'deactivated';
        this.toastService.success(`City "${city?.name}" ${status} successfully`);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to change city status');
        console.error('Error changing city status', error);
        this.isLoading.set(false);
      }
    });

    this.subscriptions.add(subscription);
  }

  toggleForm(): void {
    this.showForm.update(value => !value);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.cityForm.reset({ name: '', isActive: true });
    this.editingCityId.set(null);
    this.isSubmitting.set(false);
    this.showForm.set(false);
  }

  cancelForm(): void {
    this.resetForm();
  }

  sortBy(field: string): void {
    if (this.sortField() === field) {
      // Toggle direction if clicking the same field
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  viewCityDetails(id: number, event: Event): void {
    // This would typically navigate to a city detail page
    // For this example, we'll just show a toast
    event.stopPropagation();
    const city = this.cities().find(c => c.id === id);
    if (city) {
      this.toastService.info(`Viewing details for ${city.name}`);
    }
  }
}
