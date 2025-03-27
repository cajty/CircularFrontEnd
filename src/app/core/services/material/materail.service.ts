import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { MaterialRequest, MaterialResponse, MaterialSearchFilters } from '../../../models/material';
import { Page } from '../../../models/page';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/material`;

  createMaterial(material: MaterialRequest): Observable<MaterialResponse> {
    return this.http.post<MaterialResponse>(this.apiUrl, material);
  }

  getMaterialById(id: number): Observable<MaterialResponse> {
    return this.http.get<MaterialResponse>(`${this.apiUrl}/${id}`);
  }

  updateMaterial(id: number, material: MaterialRequest): Observable<MaterialResponse> {
    return this.http.put<MaterialResponse>(`${this.apiUrl}/${id}`, material);
  }

  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllMaterials(page: number = 0, size: number = 10, sort?: string): Observable<Page<MaterialResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<MaterialResponse>>(this.apiUrl, { params });
  }

  searchMaterials(
    filters: MaterialSearchFilters,
    page: number = 0,
    size: number = 2,
    sort?: string
  ): Observable<Page<MaterialResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    if (filters.name && filters.name.trim() !== '') {
      params = params.set('name', filters.name);
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params = params.set('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.status !== undefined && filters.status !== null) {
      params = params.set('status', filters.status.toString());
    }

    return this.http.get<Page<MaterialResponse>>(`${this.apiUrl}/search`, { params });
  }
}
