import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';
import { MaterialFormComponent } from '../material-form/material-form.component';
import { MaterialRequest, MaterialResponse } from '../../../models/material';
import { MaterialService } from '../../../core/services/material/materail.service';

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [
    CommonModule,
    MaterialFormComponent
  ],
  templateUrl: './material.component.html',
  styleUrl: './material.component.css'
})
export class MaterialComponent implements OnInit {
  material: MaterialResponse | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;
  isEditing = false;

  private materialService = inject(MaterialService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadMaterial(Number(id));
    } else {
      this.isEditing = true;
      this.loading = false;
    }
  }

  private loadMaterial(id: number): void {
    this.loading = true;
    this.error = null;

    this.materialService.getMaterialById(id)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (material) => {
          this.material = material;
        },
        error: (err) => {
          console.error('Error loading material', err);
          this.error = 'Failed to load material details. Please try again later.';
        }
      });
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onDelete(): void {
    if (!this.material?.id) return;

    if (confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      this.submitting = true;

      this.materialService.deleteMaterial(this.material.id)
        .pipe(
          finalize(() => this.submitting = false)
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/materials']);
          },
          error: (err) => {
            console.error('Error deleting material', err);
            this.error = 'Failed to delete material. Please try again later.';
          }
        });
    }
  }

  onSubmit(materialRequest: MaterialRequest): void {
    this.submitting = true;
    this.error = null;

    // If we have an existing material, update it; otherwise create a new one
    const request = this.material?.id
      ? this.materialService.updateMaterial(this.material.id, materialRequest)
      : this.materialService.createMaterial(materialRequest);

    request
      .pipe(
        finalize(() => this.submitting = false)
      )
      .subscribe({
        next: (material) => {
          this.material = material;
          this.isEditing = false;

          // If this was a new material, navigate to the edit URL
          if (!this.route.snapshot.paramMap.get('id')) {
            this.router.navigate(['/manager/materials', material.id]);
          }
        }
      });
  }

  onCancel(): void {
    if (this.material?.id) {
      // If editing an existing material, just switch back to view mode
      this.isEditing = false;
    } else {
      // If creating a new material, navigate back to the materials list
      this.router.navigate(['/materials']);
    }
  }

  // Helper method to format enum values for display
  formatEnumValue(value: string): string {
    if (!value) return '';
    // Convert SQUARE_METER to "Square Meter"
    return value.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Calculate days remaining until expiry
  calculateDaysRemaining(dateStr: Date | string): string {
    const today = new Date();
    const expiryDate = new Date(dateStr);

    // Clear time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  }
}
