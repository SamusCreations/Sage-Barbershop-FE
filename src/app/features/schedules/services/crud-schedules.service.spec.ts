import { TestBed } from '@angular/core/testing';

import { CrudSchedulesService } from './crud-schedules.service';

describe('CrudSchedulesService', () => {
  let service: CrudSchedulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrudSchedulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
