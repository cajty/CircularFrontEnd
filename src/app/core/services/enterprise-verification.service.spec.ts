import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnterpriseVerificationService } from './enterprise-verification.service';
import { environment } from '../../../environments/environment';
import { VerificationStatus } from '../../models/enterprise';
import {VerificationDocumentResponse, VerificationStatusUpdateRequest} from '../../models/enterprise-verification';


describe('EnterpriseVerificationService', () => {
  let service: EnterpriseVerificationService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/verification`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnterpriseVerificationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EnterpriseVerificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadDocument', () => {
    it('should upload a document and return the document response', () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const documentRequest = {
        enterpriseId: 1,
        documentType: 'BUSINESS_LICENSE',
        file: mockFile
      };

      const mockResponse: VerificationDocumentResponse = {
        id: 1,
        documentType: 'BUSINESS_LICENSE',
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        uploadedAt: new Date(),
        uploadedBy: '123e4567-e89b-12d3-a456-426614174000',
        isVerified: false
      };

      service.uploadDocument(documentRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/documents`);
      expect(req.request.method).toBe('POST');
      // FormData can't be directly compared, so we just check that it's a FormData instance
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('updateVerificationStatus', () => {
    it('should update verification status', () => {
      const statusRequest: VerificationStatusUpdateRequest = {
        enterpriseId: 1,
        newStatus: VerificationStatus.VERIFIED,
        reason: 'All documents are valid'
      };

      service.updateVerificationStatus(statusRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/status`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(statusRequest);
      req.flush(null, { status: 200, statusText: 'OK' });
    });
  });

  describe('getDocuments', () => {
    it('should get all documents for an enterprise', () => {
      const enterpriseId = 1;
      const mockResponse: VerificationDocumentResponse[] = [
        {
          id: 1,
          documentType: 'BUSINESS_LICENSE',
          fileName: 'license.pdf',
          contentType: 'application/pdf',
          uploadedAt: new Date(),
          uploadedBy: '123e4567-e89b-12d3-a456-426614174000',
          isVerified: true
        },
        {
          id: 2,
          documentType: 'TAX_CERTIFICATE',
          fileName: 'tax.pdf',
          contentType: 'application/pdf',
          uploadedAt: new Date(),
          uploadedBy: '123e4567-e89b-12d3-a456-426614174000',
          isVerified: false
        }
      ];

      service.getDocuments(enterpriseId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/documents/${enterpriseId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
