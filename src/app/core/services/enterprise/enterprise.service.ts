import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { EnterpriseRequest, EnterpriseResponse } from '../../../models/enterprise';
import {VerificationStatusUpdateRequest} from '../../../models/enterprise-verification';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/enterprise`;


  create(enterpriseRequest: EnterpriseRequest): Observable<EnterpriseResponse> {
    return this.http.post<EnterpriseResponse>(this.apiUrl, enterpriseRequest);
  }

 getEnterpriseOfUser(): Observable<EnterpriseResponse> {
   return this.http.get<EnterpriseResponse>(`${this.apiUrl}/user`);
 }





  update(id: number, enterpriseRequest: EnterpriseRequest): Observable<EnterpriseResponse> {
    return this.http.put<EnterpriseResponse>(`${this.apiUrl}/${id}`, enterpriseRequest);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getById(id: number): Observable<EnterpriseResponse> {
    return this.http.get<EnterpriseResponse>(`${this.apiUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, sort?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

   updateVerificationStatus(request: VerificationStatusUpdateRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/status`, request);
  }
}
