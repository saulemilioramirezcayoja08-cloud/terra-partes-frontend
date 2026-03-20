import { TestBed } from '@angular/core/testing';

import { ContextFormService } from './context-form-service';

describe('ContextFormService', () => {
  let service: ContextFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
