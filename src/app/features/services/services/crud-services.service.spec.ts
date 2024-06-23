import { TestBed } from '@angular/core/testing';

import { CrudServicesService } from './crud-services.service';

describe('CrudServicesService', () => {
  let service: CrudServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrudServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
