import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {CityRequest, CityResponse} from '../../../models/city';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/cities`;


  create(cityRequest: CityRequest): Observable<CityResponse> {
    return this.http.post<CityResponse>(this.apiUrl, cityRequest);
  }

  getById(id: number): Observable<CityResponse> {
    return this.http.get<CityResponse>(`${this.apiUrl}/${id}`);
  }

  update(id: number, cityRequest: CityRequest): Observable<CityResponse> {
    return this.http.put<CityResponse>(`${this.apiUrl}/${id}`, cityRequest);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<Set<CityResponse>> {
    return this.http.get<Set<CityResponse>>(this.apiUrl);
  }


  changeStatus(id: number): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/status/${id}`);
  }
}
