import { TestBed } from '@angular/core/testing';

import { MaterailService } from './materail.service';

describe('MaterailService', () => {
  let service: MaterailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
