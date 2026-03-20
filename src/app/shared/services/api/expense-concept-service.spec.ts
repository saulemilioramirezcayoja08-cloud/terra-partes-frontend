import { TestBed } from '@angular/core/testing';

import { ExpenseConceptService } from './expense-concept-service';

describe('ExpenseConceptService', () => {
  let service: ExpenseConceptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseConceptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
