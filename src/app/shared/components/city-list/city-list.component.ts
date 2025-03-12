import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CityService } from '../../../core/services/city/city.service';
import { ActiveCityResponse } from '../../../models/city';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-list.component.html',
  styleUrl: './city-list.component.css'
})
export class CityListComponent implements OnInit {
  @Input() selectedCityId: number | null = null;
  @Input() activeOnly = true;
  @Output() citySelected = new EventEmitter<number>();

  cities: (ActiveCityResponse)[] = [];
  loading = true;
  error: string | null = null;

  constructor(private cityService: CityService) {}

  ngOnInit(): void {
    this.loadCities();
  }

  private loadCities(): void {
    this.loading = true;
    this.error = null;

    this.cityService.getAllActiveCities()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (citySet) => {
          this.cities = Array.from(citySet);
        },
        error: (err) => {
          console.error('Error fetching cities', err);
          this.error = 'Failed to load cities';
        }
      });
  }

  onCitySelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const cityId = Number(selectElement.value);
    this.selectedCityId = cityId;
    this.citySelected.emit(cityId);
  }

  isSelected(cityId: number): boolean {
    return this.selectedCityId === cityId;
  }

  retry(): void {
    this.loadCities();
  }
}
