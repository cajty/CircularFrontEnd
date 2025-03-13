import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return this.http.post<MaterialResponse>(this.apiUrl, material)
      .pipe(
        catchError(this.handleError)
      );
  }


  getMaterialById(id: number): Observable<MaterialResponse> {
    return this.http.get<MaterialResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  updateMaterial(id: number, material: MaterialRequest): Observable<MaterialResponse> {
    return this.http.put<MaterialResponse>(`${this.apiUrl}/${id}`, material)
      .pipe(
        catchError(this.handleError)
      );
  }


  deleteMaterial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  getAllMaterials(page: number = 0, size: number = 10, sort?: string): Observable<Page<MaterialResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<MaterialResponse>>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
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

  return this.http.get<Page<MaterialResponse>>(`${this.apiUrl}/search`, { params })
    .pipe(
      catchError(this.handleError)
    );
}


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your internet connection.';
      } else {
        errorMessage = error.error?.message || `Server returned code ${error.status}`;
      }
    }

    console.error('MaterialService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
