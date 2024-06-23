import { TestBed } from '@angular/core/testing';

import { CrudReservationsService } from './crud-reservations.service';

describe('CrudReservationsService', () => {
  let service: CrudReservationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrudReservationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
