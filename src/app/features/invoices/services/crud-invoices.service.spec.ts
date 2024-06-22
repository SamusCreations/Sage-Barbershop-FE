import { TestBed } from '@angular/core/testing';

import { CrudInvoicesService } from './crud-invoices.service';

describe('CrudInvoicesService', () => {
  let service: CrudInvoicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrudInvoicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
