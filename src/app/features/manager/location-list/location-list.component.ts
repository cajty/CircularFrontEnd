import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../../core/services/location/location.service';
import { ActiveLocationResponse } from '../../../models/location';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.css'
})
export class LocationListComponent implements OnInit {
  @Input() selectedLocationId: number | null = null;
  @Output() locationSelected = new EventEmitter<number>();

  locations: ActiveLocationResponse[] = [];
  loading = true;
  error: string | null = null;

  private locationService = inject(LocationService);

  ngOnInit(): void {
    this.loadLocations();
  }

  private loadLocations(): void {
    this.loading = true;
    this.error = null;

    this.locationService.getAllActiveLocationsOfEnterprise()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (locationSet) => {
          this.locations = Array.from(locationSet);
        },
        error: (err) => {
          console.error('Error fetching locations', err);
          this.error = 'Failed to load locations';
        }
      });
  }

  onLocationSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const locationId = Number(selectElement.value);
    this.selectedLocationId = locationId;
    this.locationSelected.emit(locationId);
  }

  isSelected(locationId: number): boolean {
    return this.selectedLocationId === locationId;
  }

  retry(): void {
    this.loadLocations();
  }
}
