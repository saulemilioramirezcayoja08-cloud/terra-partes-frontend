import { TestBed } from '@angular/core/testing';

import { CodeTypeService } from './code-type-service';

describe('CodeTypeService', () => {
  let service: CodeTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
