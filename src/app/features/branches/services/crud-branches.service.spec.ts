import { TestBed } from '@angular/core/testing';

import { CrudBranchesService } from './crud-branches.service';

describe('CrudBranchesService', () => {
  let service: CrudBranchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrudBranchesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
