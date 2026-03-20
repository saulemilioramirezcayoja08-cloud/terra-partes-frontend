import { TestBed } from '@angular/core/testing';

import { IncomeConceptService } from './income-concept-service';

describe('IncomeConceptService', () => {
  let service: IncomeConceptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeConceptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
