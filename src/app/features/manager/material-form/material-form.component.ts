import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialRequest, MaterialResponse, MaterialStatus, HazardLevel, MaterialUnit } from '../../../models/material';
import { LocationListComponent } from '../location-list/location-list.component';

import { finalize } from 'rxjs';
import { CategoryListComponent } from '../../../shared/components/category-list/category-list.component';
import { MaterialService } from '../../../core/services/material/materail.service';


@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LocationListComponent,
    CategoryListComponent
  ],
  templateUrl: './material-form.component.html',
  styleUrl: './material-form.component.css'
})
export class MaterialFormComponent implements OnInit {
  @Input() material: MaterialResponse | null = null;
  @Input() submitted: boolean = false;
  @Output() formSubmit = new EventEmitter<MaterialRequest>();
  @Output() formCancel = new EventEmitter<void>();

  materialForm!: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;

  materialStatusOptions = Object.values(MaterialStatus);
  hazardLevelOptions = Object.values(HazardLevel);
  materialUnitOptions = Object.values(MaterialUnit);

  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);

  ngOnInit(): void {
    this.initForm();

    if (this.material) {
      this.patchFormWithExistingMaterial();
    }
  }

  private initForm(): void {
    this.materialForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      quantity: [10, [Validators.required, Validators.min(10)]],
      price: [0, [Validators.min(0)]],
      status: [MaterialStatus.AVAILABLE, [Validators.required]],
      hazardLevel: [HazardLevel.NONE, [Validators.required]],
      unit: [MaterialUnit.PIECE, [Validators.required]],
      categoryId: [null, [Validators.required]],
      locationId: [null, [Validators.required]],
      availableUntil: [this.getDefaultExpiryDate(), [Validators.required]]
    });
  }

  private patchFormWithExistingMaterial(): void {
    if (!this.material) return;

    this.materialForm.patchValue({
      name: this.material.name,
      description: this.material.description,
      quantity: this.material.quantity,
      price: this.material.price,
      status: this.material.status,
      hazardLevel: this.material.hazardLevel,
      unit: this.material.unit,
      categoryId: this.material.category?.id,
      locationId: this.material.location?.id,
      availableUntil: this.formatDateForInput(this.material.availableUntil)
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.materialForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.materialForm.controls).forEach(key => {
        const control = this.materialForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const materialRequest: MaterialRequest = {
      ...this.materialForm.value,
    };

    this.formSubmit.emit(materialRequest);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  onCategorySelected(categoryId: number): void {
    this.materialForm.get('categoryId')?.setValue(categoryId);
  }

  onLocationSelected(locationId: number): void {
    this.materialForm.get('locationId')?.setValue(locationId);
  }

  // Helper methods
  private getDefaultExpiryDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // Default to one month from now
    return this.formatDateForInput(date);
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }



  // Form validation helpers
  hasError(controlName: string, errorName: string): boolean {
    const control = this.materialForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.materialForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }

  // Method to format enum values for display
  formatEnumValue(value: string): string {
    if (!value) return '';
    // Convert SQUARE_METER to "Square Meter"
    return value.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}
