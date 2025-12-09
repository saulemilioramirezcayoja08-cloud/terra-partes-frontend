import { TestBed } from '@angular/core/testing';

import { GrossMarginReportService } from './gross-margin-report-service';

describe('GrossMarginReportService', () => {
  let service: GrossMarginReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrossMarginReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
