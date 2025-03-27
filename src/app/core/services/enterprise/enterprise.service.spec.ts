import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnterpriseService } from './enterprise.service';
import { environment } from '../../../../environments/environment';
import { EnterpriseRequest, EnterpriseResponse, EnterpriseType, VerificationStatus } from '../../../models/enterprise';

describe('EnterpriseService', () => {
  let service: EnterpriseService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/enterprise`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnterpriseService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EnterpriseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create an enterprise and return it', () => {
      const enterpriseRequest: EnterpriseRequest = {
        name: 'Test Enterprise',
        registrationNumber: 'TEST12345',
        enterpriseType: EnterpriseType.RECYCLER
      };

      const mockResponse: EnterpriseResponse = {
        id: 1,
        name: 'Test Enterprise',
        registrationNumber: 'TEST12345',
        type: EnterpriseType.RECYCLER,
        status: VerificationStatus.PENDING
      };

      service.create(enterpriseRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(enterpriseRequest);
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should get an enterprise by id', () => {
      const mockResponse: EnterpriseResponse = {
        id: 1,
        name: 'Test Enterprise',
        registrationNumber: 'TEST12345',
        type: EnterpriseType.RECYCLER,
        status: VerificationStatus.PENDING
      };

      service.getById(1).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an enterprise and return it', () => {
      const enterpriseRequest: EnterpriseRequest = {
        name: 'Updated Enterprise',
        registrationNumber: 'TEST12345',
        enterpriseType: EnterpriseType.PROCESSOR
      };

      const mockResponse: EnterpriseResponse = {
        id: 1,
        name: 'Updated Enterprise',
        registrationNumber: 'TEST12345',
        type: EnterpriseType.PROCESSOR,
        status: VerificationStatus.PENDING
      };

      service.update(1, enterpriseRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(enterpriseRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an enterprise', () => {
      service.delete(1).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('getAll', () => {
    it('should get all enterprises with default pagination', () => {
      const mockResponse = {
        content: [
          {
            id: 1,
            name: 'Enterprise 1',
            registrationNumber: 'REG12345',
            type: EnterpriseType.RECYCLER,
            status: VerificationStatus.VERIFIED
          },
          {
            id: 2,
            name: 'Enterprise 2',
            registrationNumber: 'REG67890',
            type: EnterpriseType.COLLECTOR,
            status: VerificationStatus.PENDING
          }
        ],
        pageable: {
          pageNumber: 0,
          pageSize: 10
        },
        totalElements: 2,
        totalPages: 1
      };

      service.getAll().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get all enterprises with custom pagination and sorting', () => {
      const mockResponse = {
        content: [
          {
            id: 2,
            name: 'Enterprise Z',
            registrationNumber: 'REG67890',
            type: EnterpriseType.COLLECTOR,
            status: VerificationStatus.PENDING
          },
          {
            id: 1,
            name: 'Enterprise A',
            registrationNumber: 'REG12345',
            type: EnterpriseType.RECYCLER,
            status: VerificationStatus.VERIFIED
          }
        ],
        pageable: {
          pageNumber: 1,
          pageSize: 5
        },
        totalElements: 10,
        totalPages: 2
      };

      service.getAll(1, 5, 'name,desc').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&size=5&sort=name,desc`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
