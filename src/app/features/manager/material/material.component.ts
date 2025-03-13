import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';
import {MaterialFormComponent} from '../material-form/material-form.component';
import {MaterialRequest, MaterialResponse} from '../../../models/material';
import {MaterialService} from '../../../core/services/material/materail.service';

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
          this.error = 'Failed to load material details';
        }
      });
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onDelete(): void {
    if (!this.material?.id) return;

    if (confirm('Are you sure you want to delete this material?')) {
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
            this.error = 'Failed to delete material';
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
            this.router.navigate(['/materials', material.id]);
          }
        },
        error: (err) => {
          console.error('Error saving material', err);
          this.error = 'Failed to save material';
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
}
