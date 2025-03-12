import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ActiveLocationResponse, LocationRequest, LocationResponse} from '../../../models/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/location`;


  create(locationRequest: LocationRequest): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(this.apiUrl, locationRequest);
  }


  getById(id: number): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.apiUrl}/${id}`);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  getAllActiveLocations(): Observable<Set<ActiveLocationResponse>> {
    return this.http.get<Set<ActiveLocationResponse>>(`${this.apiUrl}/active`);
  }
  getAllLocationOfEnterprise(): Observable<Set<ActiveLocationResponse>> {
    return this.http.get<Set<ActiveLocationResponse>>(`${this.apiUrl}/enterprise`);
  }


  update(id: number, locationRequest: LocationRequest): Observable<LocationResponse> {
    return this.http.put<LocationResponse>(`${this.apiUrl}/${id}`, locationRequest);
  }

  changeStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, {});
  }
}
