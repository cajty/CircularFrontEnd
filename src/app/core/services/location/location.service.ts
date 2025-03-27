import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ActiveLocationResponse, LocationRequest, LocationResponse} from '../../../models/location';
import {Page} from '../../../models/page';

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



   getAllLocationOfEnterprise(page: number = 1, size: number = 10, sort: string = 'id,desc'): Observable<Page<LocationResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<LocationResponse>>(`${this.apiUrl}/enterprise`, { params });
  }

   getAllActiveLocationsOfEnterprise(): Observable<Set<ActiveLocationResponse>> {
     return this.http.get<Set<ActiveLocationResponse>>(`${this.apiUrl}/enterprise-active`);
   }



  update(id: number, locationRequest: LocationRequest): Observable<LocationResponse> {
    return this.http.put<LocationResponse>(`${this.apiUrl}/${id}`, locationRequest);
  }

  changeStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, {});
  }
}
