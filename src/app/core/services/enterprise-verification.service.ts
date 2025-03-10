import { Injectable, inject } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  VerificationDocumentRequest,
  VerificationDocumentResponse,
  VerificationStatusUpdateRequest
} from '../../models/enterprise-verification';


@Injectable({
  providedIn: 'root'
})
export class EnterpriseVerificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/verification`;


  uploadDocument(request: VerificationDocumentRequest): Observable<VerificationDocumentResponse> {
    const formData = new FormData();
    formData.append('enterpriseId', request.enterpriseId.toString());
    formData.append('documentType', request.documentType);
    formData.append('file', request.file, request.file.name);

    return this.http.post<VerificationDocumentResponse>(
      `${this.apiUrl}/documents`,
      formData
    );
  }


  updateVerificationStatus(request: VerificationStatusUpdateRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/status`, request);
  }


  getDocuments(enterpriseId: number): Observable<VerificationDocumentResponse[]> {
    return this.http.get<VerificationDocumentResponse[]>(
      `${this.apiUrl}/documents/${enterpriseId}`
    );
  }
}
